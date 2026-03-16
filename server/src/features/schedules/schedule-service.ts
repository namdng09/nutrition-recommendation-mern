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
  addScheduleWorkoutExerciseRequestSchema,
  CreateScheduleRequest,
  createScheduleRequestSchema,
  UpdateScheduleDishStatusRequest,
  updateScheduleDishStatusRequestSchema,
  UpdateScheduleMealsRequest,
  updateScheduleMealsRequestSchema,
  UpdateScheduleRequest,
  updateScheduleRequestSchema,
  UpdateScheduleWorkoutExerciseRequest,
  updateScheduleWorkoutExerciseRequestSchema
} from './schedule-dto';

type ScheduleMeal = {
  mealType?: string;
  notes?: string;
  dishes?: Array<{
    dishId?: string;
  }>;
};

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

type ScheduleWorkout = UpdateScheduleRequest['workout'];
type ScheduleWorkoutInput = NonNullable<ScheduleWorkout>;
type ScheduleWorkoutExerciseInput = ScheduleWorkoutInput[number];

const validateWorkoutTargets = (
  logType: string,
  item: ScheduleWorkoutExerciseInput
) => {
  if (logType === WORKOUT_COUNTER_TYPE.DISTANCE) {
    if (!item.distanceTarget) {
      throw createHttpError(400, 'Bài tập Distance cần distanceTarget');
    }
    if (item.weightAndRepsTarget || item.durationTarget) {
      throw createHttpError(
        400,
        'Bài tập Distance chỉ được dùng distanceTarget'
      );
    }
  }

  if (logType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS) {
    if (!item.weightAndRepsTarget) {
      throw createHttpError(
        400,
        'Bài tập WeightAndReps cần weightAndRepsTarget'
      );
    }
    if (item.distanceTarget || item.durationTarget) {
      throw createHttpError(
        400,
        'Bài tập WeightAndReps chỉ được dùng weightAndRepsTarget'
      );
    }
  }

  if (logType === WORKOUT_COUNTER_TYPE.DURATION) {
    if (!item.durationTarget) {
      throw createHttpError(400, 'Bài tập Duration cần durationTarget');
    }
    if (item.distanceTarget || item.weightAndRepsTarget) {
      throw createHttpError(
        400,
        'Bài tập Duration chỉ được dùng durationTarget'
      );
    }
  }
};

const mealTypeValues = Object.values(MEAL_TYPE) as MealType[];

const isValidMealType = (value: string): value is MealType =>
  mealTypeValues.includes(value as MealType);

const validateDishIds = (meals?: ScheduleMeal[]) => {
  if (!meals) return;

  meals.forEach(meal => {
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
    const validation = createScheduleRequestSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw createHttpError(400, firstError.message);
    }

    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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
    const dishIds = new Set<string>();

    scheduleData.meals?.forEach(meal => {
      meal.dishes?.forEach(dish => {
        const dishId = dish.dishId?.toString();
        if (dishId) {
          dishIds.add(dishId);
        }
      });
    });

    if (!dishIds.size) {
      return scheduleData;
    }

    const dishes = await DishModel.find({
      _id: { $in: Array.from(dishIds) }
    })
      .select('nutrition servings')
      .lean();

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

    const totalNutrients = new Map<string, NutritionItem>();
    const totalMinerals = new Map<string, NutritionItem>();
    const totalVitamins = new Map<string, NutritionItem>();

    const mealsWithNutrition = scheduleData.meals?.map(meal => ({
      ...meal,
      dishes: meal.dishes?.map(dish => {
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

        const scaledNutrition = scaleDishNutrition(detail.nutrition, servings);

        addNutritionItemsTotal(totalNutrients, scaledNutrition.nutrients, 1);
        addNutritionItemsTotal(totalMinerals, scaledNutrition.minerals, 1);
        addNutritionItemsTotal(totalVitamins, scaledNutrition.vitamins, 1);

        return {
          ...dish
        };
      })
    }));

    const totalNutrition = {
      nutrients: Array.from(totalNutrients.values()),
      minerals: Array.from(totalMinerals.values()),
      vitamins: Array.from(totalVitamins.values())
    };

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
    const validation = updateScheduleRequestSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw createHttpError(400, firstError.message);
    }

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
    const validation = addScheduleWorkoutExerciseRequestSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw createHttpError(400, firstError.message);
    }

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
    const validation =
      updateScheduleWorkoutExerciseRequestSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw createHttpError(400, firstError.message);
    }

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

    const existingWeightAndRepsTarget = workoutExercise.weightAndRepsTarget
      ? {
          reps: workoutExercise.weightAndRepsTarget.reps,
          sets: workoutExercise.weightAndRepsTarget.sets,
          weight:
            typeof workoutExercise.weightAndRepsTarget.weight === 'number'
              ? workoutExercise.weightAndRepsTarget.weight
              : undefined
        }
      : undefined;

    const mergedPayload: ScheduleWorkoutExerciseInput = {
      exerciseId,
      logType: data.logType ?? workoutExercise.logType,
      distanceTarget:
        data.distanceTarget ?? workoutExercise.distanceTarget ?? undefined,
      weightAndRepsTarget:
        data.weightAndRepsTarget ?? existingWeightAndRepsTarget ?? undefined,
      durationTarget:
        data.durationTarget ?? workoutExercise.durationTarget ?? undefined,
      isCompleted: data.isCompleted ?? workoutExercise.isCompleted ?? false
    };

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
    const validation = updateScheduleMealsRequestSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw createHttpError(400, firstError.message);
    }

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

    const dishIds = new Set<string>();
    data.meals.forEach(meal => {
      meal.dishes?.forEach(dish => {
        if (!dish.dishId) {
          throw createHttpError(400, 'ID món ăn là bắt buộc');
        }
        dishIds.add(dish.dishId);
      });
    });

    const dishes = dishIds.size
      ? await DishModel.find({ _id: { $in: Array.from(dishIds) } })
          .select('name image servings nutrition')
          .lean()
      : [];

    if (dishes.length !== dishIds.size) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    const dishById = new Map(dishes.map(dish => [dish._id.toString(), dish]));

    const mealsByType = new Map(
      schedule.meals.map(meal => [meal.mealType, meal])
    );

    data.meals.forEach(incomingMeal => {
      let targetMeal = mealsByType.get(incomingMeal.mealType);

      if (!targetMeal) {
        targetMeal = schedule.meals.create({
          mealType: incomingMeal.mealType,
          dishes: []
        });
        schedule.meals.push(targetMeal);
        mealsByType.set(incomingMeal.mealType, targetMeal);
      }

      if (incomingMeal.notes !== undefined) {
        targetMeal.notes = incomingMeal.notes;
      }

      if (incomingMeal.dishes?.length) {
        const existingDishes = targetMeal.dishes ?? [];

        incomingMeal.dishes.forEach(dish => {
          const dishInfo = dish.dishId ? dishById.get(dish.dishId) : null;

          if (!dishInfo) {
            throw createHttpError(404, 'Không tìm thấy món ăn');
          }

          const baseEnergy = calculateDishEnergy(dishInfo);
          const requestedServings = dish.servings ?? dishInfo.servings ?? 1;

          const dishPayload = {
            dishId: dishInfo._id,
            name: dishInfo.name,
            image: dishInfo.image,
            servings: requestedServings,
            energy: baseEnergy * requestedServings,
            isEaten: dish.isEaten ?? false
          };

          const existingIndex = existingDishes.findIndex(
            existingDish =>
              existingDish.dishId?.toString() === dishInfo._id.toString()
          );

          if (existingIndex >= 0) {
            Object.assign(existingDishes[existingIndex], dishPayload);
            if (dish.isEaten !== undefined) {
              existingDishes[existingIndex].isEaten = dish.isEaten;
            }
          } else {
            const createdDish = existingDishes.create(dishPayload);
            existingDishes.push(createdDish);
          }
        });

        targetMeal.dishes = existingDishes;
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
    const validation = updateScheduleDishStatusRequestSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw createHttpError(400, firstError.message);
    }

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

    const dishes = meal.dishes ?? [];
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
