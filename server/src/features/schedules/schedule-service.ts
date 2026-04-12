import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { ROLE } from '~/shared/constants/role';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import {
  DishModel,
  ExerciseModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import type { Schedule } from '~/shared/database/models/schedule-model';
import { eventBus } from '~/shared/events/event-bus';
import { EVENTS } from '~/shared/events/event-types';
import {
  buildPaginateOptions,
  type PaginateResponse,
  validateObjectId
} from '~/shared/utils';

import {
  AddScheduleWorkoutExerciseRequest,
  CreateScheduleRequest,
  UpdateScheduleDishStatusRequest,
  UpdateScheduleMealsRequest,
  UpdateScheduleRequest,
  UpdateScheduleWorkoutExerciseRequest
} from './schedule-dto';

type MealType = (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE];

type NutritionItem = {
  label?: string | null;
  value?: number | null;
  unit?: string | null;
};

type DishNutrition = {
  nutrients?: NutritionItem[] | null;
  minerals?: NutritionItem[] | null;
  vitamins?: NutritionItem[] | null;
} | null;

type ScheduleWorkoutInput = NonNullable<UpdateScheduleRequest['workout']>;
type ScheduleWorkoutExerciseInput = ScheduleWorkoutInput[number];
type LoadedDish = Awaited<ReturnType<typeof loadDishesByIds>>[number];
type IncomingScheduleMealDish = NonNullable<
  UpdateScheduleMealsRequest['meals'][number]['dishes']
>[number];

const collectDishIdsOrThrow = (meals: UpdateScheduleMealsRequest['meals']) => {
  const dishIds = new Set<string>();
  meals.forEach(meal => {
    meal.dishes?.forEach(dish => {
      if (!dish.dishId) {
        throw createHttpError(400, 'ID món ăn là bắt buộc');
      }
      dishIds.add(dish.dishId);
    });
  });

  return dishIds;
};

const loadDishesByIds = async (dishIds: Set<string>) =>
  dishIds.size
    ? ((await DishModel.find({ _id: { $in: Array.from(dishIds) } })
        .select('name image servings nutrition isPublic user')
        .lean()) as Array<{
        _id: { toString: () => string };
        isPublic?: boolean;
        user?: { _id?: { toString: () => string } } | null;
        servings?: number;
        name?: string;
        image?: string;
        nutrition?: unknown;
      }>)
    : [];

const buildMergedWorkoutPayload = (
  exerciseId: string,
  workoutExercise: unknown,
  data: UpdateScheduleWorkoutExerciseRequest
): ScheduleWorkoutExerciseInput => {
  const source = workoutExercise as {
    logType?: ScheduleWorkoutExerciseInput['logType'] | null;
    distanceTarget?: ScheduleWorkoutExerciseInput['distanceTarget'] | null;
    weightAndRepsTarget?: {
      reps: number;
      sets?: number;
      weight?: number | null;
    } | null;
    durationTarget?: ScheduleWorkoutExerciseInput['durationTarget'] | null;
    isCompleted?: boolean;
  };

  const existingWeightAndRepsTarget = source.weightAndRepsTarget
    ? {
        reps: source.weightAndRepsTarget.reps,
        sets: source.weightAndRepsTarget.sets,
        weight:
          typeof source.weightAndRepsTarget.weight === 'number'
            ? source.weightAndRepsTarget.weight
            : undefined
      }
    : undefined;

  return {
    exerciseId,
    logType: (data.logType ?? source.logType) as
      | ScheduleWorkoutExerciseInput['logType']
      | undefined,
    distanceTarget: data.distanceTarget ?? source.distanceTarget ?? undefined,
    weightAndRepsTarget:
      data.weightAndRepsTarget ?? existingWeightAndRepsTarget ?? undefined,
    durationTarget: data.durationTarget ?? source.durationTarget ?? undefined,
    isCompleted: data.isCompleted ?? source.isCompleted ?? false
  };
};

const WORKOUT_TARGET_RULES = {
  [WORKOUT_COUNTER_TYPE.DISTANCE]: {
    requiredKey: 'distanceTarget',
    requiredError: 'Bài tập Distance cần distanceTarget',
    exclusiveError: 'Bài tập Distance chỉ được dùng distanceTarget'
  },
  [WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS]: {
    requiredKey: 'weightAndRepsTarget',
    requiredError: 'Bài tập WeightAndReps cần weightAndRepsTarget',
    exclusiveError: 'Bài tập WeightAndReps chỉ được dùng weightAndRepsTarget'
  },
  [WORKOUT_COUNTER_TYPE.DURATION]: {
    requiredKey: 'durationTarget',
    requiredError: 'Bài tập Duration cần durationTarget',
    exclusiveError: 'Bài tập Duration chỉ được dùng durationTarget'
  }
} as const;

const validateWorkoutTargets = (
  logType: string,
  item: ScheduleWorkoutExerciseInput
) => {
  const rule =
    WORKOUT_TARGET_RULES[logType as keyof typeof WORKOUT_TARGET_RULES];

  if (!rule) return;

  const targetEntries = [
    ['distanceTarget', item.distanceTarget],
    ['weightAndRepsTarget', item.weightAndRepsTarget],
    ['durationTarget', item.durationTarget]
  ] as const;

  const requiredTarget = targetEntries.find(
    ([key]) => key === rule.requiredKey
  )?.[1];

  if (!requiredTarget) {
    throw createHttpError(400, rule.requiredError);
  }

  const hasOtherTargets = targetEntries.some(
    ([key, value]) => key !== rule.requiredKey && Boolean(value)
  );

  if (hasOtherTargets) {
    throw createHttpError(400, rule.exclusiveError);
  }
};

const mealTypeValues = Object.values(MEAL_TYPE) as MealType[];

const isValidMealType = (value: string): value is MealType =>
  mealTypeValues.includes(value as MealType);

const validateDishIds = (
  meals?: UpdateScheduleRequest['meals'] | UpdateScheduleMealsRequest['meals']
) => {
  if (!meals) return;

  const mealsToValidate = meals as Array<{
    dishes?: Array<{
      dishId?: string;
    }>;
  }>;

  mealsToValidate.forEach(meal => {
    meal.dishes?.forEach(dish => {
      if (dish.dishId && !validateObjectId(dish.dishId)) {
        throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
      }
    });
  });
};

const calculateDishEnergy = (dish: unknown) => {
  if (!dish || typeof dish !== 'object') return 0;

  const isValidNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

  const nutrients = (dish as { nutrition?: unknown }).nutrition;
  const energyValue =
    nutrients && typeof nutrients === 'object'
      ? (nutrients as { nutrients?: Array<{ value?: unknown }> }).nutrients?.[0]
          ?.value
      : undefined;

  return isValidNumber(energyValue) ? energyValue : 0;
};

const createScheduleMealDishPayload = (
  dishInfo: LoadedDish,
  dish: IncomingScheduleMealDish
) => {
  const baseEnergy = calculateDishEnergy(dishInfo);
  const requestedServings = dish.servings ?? dishInfo.servings ?? 1;

  return {
    dishId: dishInfo._id,
    name: dishInfo.name,
    image: dishInfo.image,
    servings: requestedServings,
    energy: baseEnergy * requestedServings,
    isEaten: dish.isEaten ?? false
  };
};

const findDishIndexByDishId = (
  dishes: {
    findIndex: (
      predicate: (dish: {
        dishId?: { toString: () => string } | null;
      }) => boolean
    ) => number;
  },
  dishId: string
) => dishes.findIndex(dish => dish.dishId?.toString() === dishId);

const buildDishByIdMap = (dishes: LoadedDish[]) =>
  new Map(dishes.map(dish => [dish._id.toString(), dish] as const));

const buildMealsByTypeMap = (schedule: {
  meals: Array<{ mealType: string }>;
}) => new Map(schedule.meals.map(meal => [meal.mealType, meal] as const));

const getOrCreateMealByType = (
  schedule: {
    meals: {
      create: (payload: { mealType: string; dishes: [] }) => any;
      push: (meal: any) => number;
    };
  },
  mealsByType: Map<string, any>,
  mealType: string
) => {
  let targetMeal = mealsByType.get(mealType);
  if (!targetMeal) {
    targetMeal = schedule.meals.create({
      mealType,
      dishes: []
    });
    schedule.meals.push(targetMeal);
    mealsByType.set(mealType, targetMeal);
  }

  return targetMeal;
};

const upsertDishToMeal = (
  dishes: {
    create: (payload: unknown) => any;
    push: (item: any) => number;
    [index: number]: {
      isEaten?: boolean;
      [key: string]: unknown;
    };
  } & {
    findIndex: (
      predicate: (dish: {
        dishId?: { toString: () => string } | null;
      }) => boolean
    ) => number;
  },
  targetDishId: string,
  dishPayload: Record<string, unknown>,
  isEaten: boolean | undefined
) => {
  const existingIndex = findDishIndexByDishId(dishes, targetDishId);

  if (existingIndex >= 0) {
    Object.assign(dishes[existingIndex], dishPayload);
    if (isEaten !== undefined) {
      dishes[existingIndex].isEaten = isEaten;
    }
    return;
  }

  const createdDish = dishes.create(dishPayload);
  dishes.push(createdDish);
};

const scaleNutritionItems = (
  items: NutritionItem[] | null | undefined,
  factor: number
) =>
  (items ?? []).map(item => ({
    ...item,
    value: typeof item.value === 'number' ? item.value * factor : item.value
  }));

const scaleDishNutrition = (nutrition: DishNutrition, factor: number) => {
  if (!Number.isFinite(factor) || !nutrition) {
    return {
      nutrients: nutrition?.nutrients ?? [],
      minerals: nutrition?.minerals ?? [],
      vitamins: nutrition?.vitamins ?? []
    };
  }

  return {
    nutrients: scaleNutritionItems(nutrition.nutrients, factor),
    minerals: scaleNutritionItems(nutrition.minerals, factor),
    vitamins: scaleNutritionItems(nutrition.vitamins, factor)
  };
};

const addNutritionItemsTotal = (
  target: Map<string, NutritionItem>,
  items: NutritionItem[] | null | undefined,
  multiplier: number
) => {
  if (!items || items.length === 0) return;
  for (const item of items) {
    const label = item?.label ?? undefined;
    const unit = item?.unit ?? undefined;
    const value = item?.value;
    if (!label || !unit || typeof value !== 'number') continue;
    const key = `${label}|${unit}`;
    const current = target.get(key);
    if (current) {
      current.value = (current.value ?? 0) + value * multiplier;
    } else {
      target.set(key, {
        label,
        unit,
        value: value * multiplier
      });
    }
  }
};

const collectScheduleDishIds = (
  meals:
    | Iterable<{
        dishes?: Iterable<{
          dishId?: {
            toString: () => string;
          } | null;
        }> | null;
      }>
    | undefined
) => {
  const dishIds = new Set<string>();

  for (const meal of meals ?? []) {
    for (const dish of meal.dishes ?? []) {
      const dishId = dish.dishId?.toString();
      if (dishId) {
        dishIds.add(dishId);
      }
    }
  }

  return dishIds;
};

const buildNutritionByDishId = (
  dishes: Array<{
    _id: {
      toString: () => string;
    };
    nutrition?: DishNutrition;
    servings?: number;
  }>
) => {
  const nutritionByDishId = new Map<
    string,
    { nutrition: DishNutrition; servings: number }
  >();

  dishes.forEach(dish => {
    nutritionByDishId.set(dish._id.toString(), {
      nutrition: dish.nutrition ?? null,
      servings: dish.servings ?? 1
    });
  });

  return nutritionByDishId;
};

const enrichMealsWithNutrition = (
  meals:
    | Iterable<{
        dishes?: Iterable<{
          dishId?: {
            toString: () => string;
          } | null;
          servings?: number | null;
        }> | null;
      }>
    | undefined,
  nutritionByDishId: Map<string, { nutrition: DishNutrition; servings: number }>
) => {
  const totalNutrients = new Map<string, NutritionItem>();
  const totalMinerals = new Map<string, NutritionItem>();
  const totalVitamins = new Map<string, NutritionItem>();

  const mealsWithNutrition = Array.from(meals ?? []).map(meal => {
    const dishes = meal.dishes
      ? Array.from(meal.dishes).map(dish => {
          const dishId = dish.dishId?.toString();
          if (!dishId) {
            return {
              ...dish,
              nutrition: scaleDishNutrition(null, 1)
            };
          }

          const detail = nutritionByDishId.get(dishId);
          if (!detail) {
            return {
              ...dish,
              nutrition: scaleDishNutrition(null, 1)
            };
          }

          const servings =
            typeof dish.servings === 'number'
              ? dish.servings
              : (detail.servings ?? 1);

          const scaledNutrition = scaleDishNutrition(
            detail.nutrition,
            servings
          );

          addNutritionItemsTotal(totalNutrients, scaledNutrition.nutrients, 1);
          addNutritionItemsTotal(totalMinerals, scaledNutrition.minerals, 1);
          addNutritionItemsTotal(totalVitamins, scaledNutrition.vitamins, 1);

          return {
            ...dish
          };
        })
      : undefined;

    return {
      ...meal,
      dishes
    };
  });

  return {
    mealsWithNutrition,
    totalNutrition: {
      nutrients: Array.from(totalNutrients.values()),
      minerals: Array.from(totalMinerals.values()),
      vitamins: Array.from(totalVitamins.values())
    }
  };
};

const ensureUniqueWorkoutExerciseIds = (items: ScheduleWorkoutInput) => {
  const ids = new Set<string>();
  items.forEach(item => {
    const key = item.exerciseId.trim();
    if (ids.has(key)) {
      throw createHttpError(409, `Bài tập ${key} đã tồn tại trong workout`);
    }
    ids.add(key);
  });
};

async function resolveScheduleWorkoutExercises(items: ScheduleWorkoutInput) {
  ensureUniqueWorkoutExerciseIds(items);

  return Promise.all(
    items.map(async item => {
      if (!validateObjectId(item.exerciseId)) {
        throw createHttpError(
          400,
          `Định dạng ID bài tập không hợp lệ: ${item.exerciseId}`
        );
      }

      const exercise = await ExerciseModel.findById(item.exerciseId);

      if (!exercise) {
        throw createHttpError(
          404,
          `Không tìm thấy bài tập với ID: ${item.exerciseId}`
        );
      }

      const exerciseLogType = exercise.logType;
      if (!exerciseLogType) {
        throw createHttpError(
          400,
          `Bài tập ${exercise.name} chưa có logType mặc định`
        );
      }

      if (item.logType && item.logType !== exerciseLogType) {
        throw createHttpError(
          400,
          `logType của bài tập ${exercise.name} phải là ${exerciseLogType}`
        );
      }

      const resolvedLogType = item.logType ?? exerciseLogType;
      validateWorkoutTargets(resolvedLogType, item);

      return {
        exerciseId: exercise._id,
        exerciseName: exercise.name,
        exerciseType: exercise.type,
        exerciseTutorial: exercise.tutorial ?? '',
        logType: resolvedLogType,
        distanceTarget: item.distanceTarget,
        weightAndRepsTarget: item.weightAndRepsTarget,
        durationTarget: item.durationTarget,
        isCompleted: item.isCompleted ?? false
      };
    })
  );
}

export const ScheduleService = {
  createSchedule: async (
    userId: string,
    userName: string,
    data: CreateScheduleRequest
  ) => {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    const meals = user.mealSettings.map(setting => ({
      mealType: setting.name,
      dishes: []
    }));

    const workout = data.workout
      ? await resolveScheduleWorkoutExercises(data.workout)
      : [];

    const newSchedule = await ScheduleModel.create({
      user: {
        _id: userId,
        name: userName
      },
      date: data.date,
      dayOfWeek: data.dayOfWeek,
      meals,
      workout
    });

    if (!newSchedule) {
      throw createHttpError(500, 'Tạo lịch ăn thất bại');
    }

    eventBus.emit(EVENTS.SCHEDULE_CREATED, {
      userId,
      scheduleId: newSchedule._id.toString()
    });

    return newSchedule;
  },

  viewSchedules: async (
    userId: string,
    role: string | undefined,
    parsed: QueryOptions
  ): Promise<PaginateResponse<Schedule>> => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);
    const scopedFilter: Record<string, unknown> =
      role === ROLE.ADMIN ? { ...filter } : { ...filter, 'user._id': userId };

    const result = await ScheduleModel.paginate(scopedFilter, options);

    return result as unknown as PaginateResponse<Schedule>;
  },

  viewScheduleDetail: async (
    id: string,
    userId: string,
    role: string | undefined
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (role !== ROLE.ADMIN && schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xem lịch ăn này');
    }

    const scheduleData = schedule.toObject();
    const dishIds = collectScheduleDishIds(scheduleData.meals);

    if (!dishIds.size) {
      return scheduleData;
    }

    const dishes = await DishModel.find({
      _id: { $in: Array.from(dishIds) }
    })
      .select('nutrition servings')
      .lean();
    const nutritionByDishId = buildNutritionByDishId(dishes);
    const { mealsWithNutrition, totalNutrition } = enrichMealsWithNutrition(
      scheduleData.meals,
      nutritionByDishId
    );

    return {
      ...scheduleData,
      meals: mealsWithNutrition,
      totalNutrition
    };
  },

  updateSchedule: async (
    id: string,
    userId: string,
    role: string | undefined,
    data: UpdateScheduleRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (role !== ROLE.ADMIN && schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    validateDishIds(data.meals);

    const updatePayload: Record<string, unknown> = { ...data };

    if (typeof data.workout !== 'undefined') {
      updatePayload.workout = await resolveScheduleWorkoutExercises(
        data.workout
      );
    }

    const updatedSchedule = await ScheduleModel.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true
      }
    );

    if (!updatedSchedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    return updatedSchedule;
  },

  addScheduleWorkoutExercise: async (
    id: string,
    userId: string,
    data: AddScheduleWorkoutExerciseRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    const existingExercise = schedule.workout.find(
      item => item.exerciseId?.toString() === data.exerciseId
    );

    if (existingExercise) {
      throw createHttpError(409, 'Bài tập đã tồn tại trong workout');
    }

    const [resolvedExercise] = await resolveScheduleWorkoutExercises([data]);

    schedule.workout.push(resolvedExercise);
    await schedule.save();

    return schedule;
  },

  updateScheduleWorkoutExercise: async (
    id: string,
    userId: string,
    exerciseId: string,
    data: UpdateScheduleWorkoutExerciseRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    if (!validateObjectId(exerciseId)) {
      throw createHttpError(400, 'Định dạng ID bài tập không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    const workoutExercise = schedule.workout.find(
      item => item.exerciseId?.toString() === exerciseId
    );

    if (!workoutExercise) {
      throw createHttpError(404, 'Không tìm thấy bài tập trong workout');
    }

    const mergedPayload = buildMergedWorkoutPayload(
      exerciseId,
      {
        logType: workoutExercise.logType,
        distanceTarget: workoutExercise.distanceTarget,
        weightAndRepsTarget: workoutExercise.weightAndRepsTarget,
        durationTarget: workoutExercise.durationTarget,
        isCompleted: workoutExercise.isCompleted
      },
      data
    );

    const [resolvedExercise] = await resolveScheduleWorkoutExercises([
      mergedPayload
    ]);

    Object.assign(workoutExercise, resolvedExercise);

    await schedule.save();

    return schedule;
  },

  removeScheduleWorkoutExercise: async (
    id: string,
    userId: string,
    exerciseId: string
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    if (!validateObjectId(exerciseId)) {
      throw createHttpError(400, 'Định dạng ID bài tập không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    const workoutExerciseIndex = schedule.workout.findIndex(
      item => item.exerciseId?.toString() === exerciseId
    );

    if (workoutExerciseIndex === -1) {
      throw createHttpError(404, 'Không tìm thấy bài tập trong workout');
    }

    schedule.workout.splice(workoutExerciseIndex, 1);
    await schedule.save();

    return schedule;
  },

  updateScheduleMeals: async (
    id: string,
    userId: string,
    data: UpdateScheduleMealsRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    validateDishIds(data.meals);

    const dishIds = collectDishIdsOrThrow(data.meals);
    const dishes = await loadDishesByIds(dishIds);

    if (dishes.length !== dishIds.size) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    const otherPrivateDishes = dishes.filter(
      dish => !dish.isPublic && dish.user?._id?.toString() !== userId
    );

    if (otherPrivateDishes.length > 0) {
      throw createHttpError(
        403,
        'Bạn không có quyền sử dụng món ăn riêng tư của người khác'
      );
    }

    const dishById = buildDishByIdMap(dishes);
    const mealsByType = buildMealsByTypeMap(schedule);

    data.meals.forEach(incomingMeal => {
      const targetMeal = getOrCreateMealByType(
        schedule,
        mealsByType,
        incomingMeal.mealType
      );

      if (incomingMeal.notes !== undefined) {
        targetMeal.notes = incomingMeal.notes;
      }

      if (incomingMeal.dishes?.length) {
        if (!targetMeal.dishes) {
          return;
        }

        incomingMeal.dishes.forEach(dish => {
          const dishInfo = dish.dishId ? dishById.get(dish.dishId) : null;

          if (!dishInfo) {
            throw createHttpError(404, 'Không tìm thấy món ăn');
          }

          const dishPayload = createScheduleMealDishPayload(dishInfo, dish);

          upsertDishToMeal(
            targetMeal.dishes,
            dishInfo._id.toString(),
            dishPayload,
            dish.isEaten
          );
        });
      }
    });

    await schedule.save();

    return schedule;
  },

  updateScheduleDishStatus: async (
    id: string,
    userId: string,
    mealType: string,
    dishId: string,
    data: UpdateScheduleDishStatusRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    if (!validateObjectId(dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    if (!isValidMealType(mealType)) {
      throw createHttpError(400, 'Loại bữa ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    const meal = schedule.meals.find(item => item.mealType === mealType);

    if (!meal) {
      throw createHttpError(404, 'Không tìm thấy bữa ăn');
    }

    const dishes = meal.dishes ?? [];
    const dish = dishes.find(item => item.dishId?.toString() === dishId);

    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn trong bữa');
    }

    dish.isEaten = data.isEaten;

    await schedule.save();

    if (data.isEaten) {
      eventBus.emit(EVENTS.SCHEDULE_DISH_EATEN, {
        userId,
        dishId,
        scheduleId: id
      });
    }

    return schedule;
  },

  deleteSchedule: async (
    id: string,
    userId: string,
    role: string | undefined
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (role !== ROLE.ADMIN && schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xóa lịch ăn này');
    }

    await ScheduleModel.findByIdAndDelete(id);
  },

  removeScheduleDish: async (
    id: string,
    userId: string,
    mealType: string,
    dishId: string
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    if (!validateObjectId(dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    const meal = schedule.meals.find(item => item.mealType === mealType);

    if (!meal) {
      throw createHttpError(404, 'Không tìm thấy bữa ăn');
    }

    const dishes = (meal.dishes ?? []) as Array<{
      dishId?: { toString: () => string } | null;
    }>;
    const dishIndex = dishes.findIndex(
      dish => dish.dishId?.toString() === dishId
    );

    if (dishIndex === -1) {
      throw createHttpError(404, 'Không tìm thấy món ăn trong bữa');
    }

    dishes.splice(dishIndex, 1);

    await schedule.save();

    return schedule;
  },

  clearScheduleMealDishes: async (
    id: string,
    userId: string,
    mealType: string
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID lịch ăn không hợp lệ');
    }

    const schedule = await ScheduleModel.findById(id);

    if (!schedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    if (schedule.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật lịch ăn này');
    }

    const meal = schedule.meals.find(item => item.mealType === mealType);

    if (!meal) {
      throw createHttpError(404, 'Không tìm thấy bữa ăn');
    }

    if (meal.dishes?.length) {
      meal.dishes.splice(0, meal.dishes.length);
    }

    await schedule.save();

    return schedule;
  }
};
