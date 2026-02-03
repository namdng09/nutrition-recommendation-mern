import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { ROLE } from '~/shared/constants/role';
import { UNIT } from '~/shared/constants/unit';
import {
  DishModel,
  IngredientModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import type { Schedule } from '~/shared/database/models/schedule-model';
import {
  buildPaginateOptions,
  type PaginateResponse,
  validateObjectId
} from '~/shared/utils';

import {
  CreateScheduleRequest,
  UpdateScheduleDishStatusRequest,
  UpdateScheduleMealsRequest,
  UpdateScheduleRequest
} from './schedule-dto';

type ScheduleMeal = {
  mealType?: string;
  notes?: string;
  dishes?: Array<{
    dishId?: string;
  }>;
};

type MealType = (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE];

const nutrientKeys = [
  'calories',
  'carbs',
  'fat',
  'protein',
  'fiber',
  'sodium',
  'cholesterol'
] as const;

type NutrientKey = (typeof nutrientKeys)[number];
type NutrientValue = { value: number; unit: string };
type NutrientsTotal = Record<NutrientKey, NutrientValue>;
type NutritionItem = { label: string; value: number; unit: string };
type NutrientsInput = Partial<
  Record<NutrientKey, { value?: number | null; unit?: string | null } | null>
> | null;
type NutritionItemsInput = Array<{
  label?: string | null;
  value?: number | null;
  unit?: string | null;
} | null> | null;
type DetailNutritionTotal = {
  nutrients: NutrientsTotal;
  minerals: NutritionItem[];
  vitamins: NutritionItem[];
  sugars: NutritionItem[];
  fats: NutritionItem[];
  fattyAcids: NutritionItem[];
  aminoAcids: NutritionItem[];
};

const mealTypeValues = Object.values(MEAL_TYPE) as MealType[];

const isValidMealType = (value: string): value is MealType =>
  mealTypeValues.includes(value as MealType);

const ensureValidDate = (value: Date) => {
  if (Number.isNaN(value.getTime())) {
    throw createHttpError(400, 'Định dạng ngày không hợp lệ');
  }
  return value;
};

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

const calculateDishCalories = (dish: unknown) => {
  if (!dish || typeof dish !== 'object') return 0;

  const isValidNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

  const ingredients = (dish as { ingredients?: unknown }).ingredients;
  if (!Array.isArray(ingredients) || ingredients.length === 0) return 0;

  const totalCalories = ingredients.reduce((sum, ingredient) => {
    if (!ingredient || typeof ingredient !== 'object') return sum;

    const nutrients = (ingredient as { nutrients?: unknown }).nutrients;
    const caloriesValue =
      nutrients && typeof nutrients === 'object'
        ? (nutrients as { calories?: { value?: unknown } }).calories?.value
        : undefined;

    const baseUnit = (ingredient as { baseUnit?: unknown }).baseUnit;
    const baseAmount =
      baseUnit && typeof baseUnit === 'object'
        ? (baseUnit as { amount?: unknown }).amount
        : undefined;

    const units = (ingredient as { units?: unknown }).units;
    const unitArray = Array.isArray(units) ? units : [];
    const unit =
      unitArray.find(
        item => !!item && (item as { isDefault?: unknown }).isDefault
      ) ?? unitArray[0];

    const unitValue =
      unit && typeof unit === 'object'
        ? (unit as { value?: unknown }).value
        : undefined;
    const unitQuantity =
      unit && typeof unit === 'object'
        ? (unit as { quantity?: unknown }).quantity
        : undefined;

    if (
      !isValidNumber(caloriesValue) ||
      !isValidNumber(baseAmount) ||
      !isValidNumber(unitValue) ||
      !isValidNumber(unitQuantity) ||
      baseAmount === 0
    ) {
      return sum;
    }

    const totalAmount = unitValue * unitQuantity;
    return sum + (totalAmount / baseAmount) * caloriesValue;
  }, 0);

  return Math.round(totalCalories);
};

const createEmptyNutrientsTotal = (): NutrientsTotal => ({
  calories: { value: 0, unit: UNIT.KILOCALORIE },
  carbs: { value: 0, unit: UNIT.GRAM },
  fat: { value: 0, unit: UNIT.GRAM },
  protein: { value: 0, unit: UNIT.GRAM },
  fiber: { value: 0, unit: UNIT.GRAM },
  sodium: { value: 0, unit: UNIT.GRAM },
  cholesterol: { value: 0, unit: UNIT.GRAM }
});

const createEmptyDetailNutritionTotal = (): DetailNutritionTotal => ({
  nutrients: createEmptyNutrientsTotal(),
  minerals: [],
  vitamins: [],
  sugars: [],
  fats: [],
  fattyAcids: [],
  aminoAcids: []
});

const addNutrientsTotal = (
  total: NutrientsTotal,
  nutrients?: NutrientsInput
) => {
  if (!nutrients) return;
  for (const key of nutrientKeys) {
    const item = nutrients[key];
    if (!item) continue;
    const value = typeof item.value === 'number' ? item.value : 0;
    const unit = typeof item.unit === 'string' ? item.unit : undefined;
    const current = total[key];
    if (unit && current.unit !== unit) {
      if (current.value !== 0) {
        throw createHttpError(
          400,
          `Đơn vị dinh dưỡng không đồng nhất cho ${key}`
        );
      }
      current.unit = unit;
    }
    current.value += value;
  }
};

const addNutritionItemsTotal = (
  target: Map<string, NutritionItem>,
  items?: NutritionItemsInput
) => {
  if (!items || items.length === 0) return;
  for (const item of items) {
    const label = item?.label ?? undefined;
    const unit = item?.unit ?? undefined;
    if (!label || !unit) continue;
    const value = typeof item?.value === 'number' ? item.value : 0;
    const key = `${label}|${unit}`;
    const current = target.get(key);
    if (current) {
      current.value += value;
    } else {
      target.set(key, {
        label,
        unit,
        value
      });
    }
  }
};

const scaleDetailNutrition = (
  detail: DetailNutritionTotal,
  factor: number
): DetailNutritionTotal => {
  if (!Number.isFinite(factor)) return detail;

  const scaleItem = (item: NutritionItem) => ({
    ...item,
    value: item.value * factor
  });

  return {
    nutrients: {
      calories: {
        value: detail.nutrients.calories.value * factor,
        unit: detail.nutrients.calories.unit
      },
      carbs: {
        value: detail.nutrients.carbs.value * factor,
        unit: detail.nutrients.carbs.unit
      },
      fat: {
        value: detail.nutrients.fat.value * factor,
        unit: detail.nutrients.fat.unit
      },
      protein: {
        value: detail.nutrients.protein.value * factor,
        unit: detail.nutrients.protein.unit
      },
      fiber: {
        value: detail.nutrients.fiber.value * factor,
        unit: detail.nutrients.fiber.unit
      },
      sodium: {
        value: detail.nutrients.sodium.value * factor,
        unit: detail.nutrients.sodium.unit
      },
      cholesterol: {
        value: detail.nutrients.cholesterol.value * factor,
        unit: detail.nutrients.cholesterol.unit
      }
    },
    minerals: detail.minerals.map(scaleItem),
    vitamins: detail.vitamins.map(scaleItem),
    sugars: detail.sugars.map(scaleItem),
    fats: detail.fats.map(scaleItem),
    fattyAcids: detail.fattyAcids.map(scaleItem),
    aminoAcids: detail.aminoAcids.map(scaleItem)
  };
};

export const ScheduleService = {
  createSchedule: async (
    userId: string,
    userName: string,
    data: CreateScheduleRequest
  ) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    const date = ensureValidDate(data.date);
    const user = await UserModel.findById(userId);

    if (!user) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    const meals = user.mealSettings.map(setting => ({
      mealType: setting.name,
      dishes: []
    }));

    const newSchedule = await ScheduleModel.create({
      user: {
        _id: userId,
        name: userName
      },
      date,
      dayOfWeek: data.dayOfWeek,
      meals
    });

    if (!newSchedule) {
      throw createHttpError(500, 'Tạo lịch ăn thất bại');
    }

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
      .select('ingredients servings')
      .lean();

    const ingredientIds = new Set<string>();
    dishes.forEach(dish => {
      dish.ingredients?.forEach(ingredient => {
        const ingredientId = ingredient.ingredientId?.toString();
        if (ingredientId) {
          ingredientIds.add(ingredientId);
        }
      });
    });

    const ingredients = ingredientIds.size
      ? await IngredientModel.find({
          _id: { $in: Array.from(ingredientIds) }
        }).lean()
      : [];

    const ingredientById = new Map(
      ingredients.map(ingredient => [ingredient._id.toString(), ingredient])
    );

    const nutritionByDishId = new Map<
      string,
      { nutrition: DetailNutritionTotal; servings: number }
    >();

    dishes.forEach(dish => {
      const total = createEmptyDetailNutritionTotal();
      const mineralsMap = new Map<string, NutritionItem>();
      const vitaminsMap = new Map<string, NutritionItem>();
      const sugarsMap = new Map<string, NutritionItem>();
      const fatsMap = new Map<string, NutritionItem>();
      const fattyAcidsMap = new Map<string, NutritionItem>();
      const aminoAcidsMap = new Map<string, NutritionItem>();

      dish.ingredients?.forEach(ingredient => {
        const ingredientId = ingredient.ingredientId?.toString();
        if (!ingredientId) return;
        const ingredientData = ingredientById.get(ingredientId);
        if (!ingredientData?.nutrition) return;

        addNutrientsTotal(total.nutrients, ingredientData.nutrition.nutrients);
        addNutritionItemsTotal(mineralsMap, ingredientData.nutrition.minerals);
        addNutritionItemsTotal(vitaminsMap, ingredientData.nutrition.vitamins);
        addNutritionItemsTotal(sugarsMap, ingredientData.nutrition.sugars);
        addNutritionItemsTotal(fatsMap, ingredientData.nutrition.fats);
        addNutritionItemsTotal(
          fattyAcidsMap,
          ingredientData.nutrition.fattyAcids
        );
        addNutritionItemsTotal(
          aminoAcidsMap,
          ingredientData.nutrition.aminoAcids
        );
      });

      total.minerals = Array.from(mineralsMap.values());
      total.vitamins = Array.from(vitaminsMap.values());
      total.sugars = Array.from(sugarsMap.values());
      total.fats = Array.from(fatsMap.values());
      total.fattyAcids = Array.from(fattyAcidsMap.values());
      total.aminoAcids = Array.from(aminoAcidsMap.values());

      nutritionByDishId.set(dish._id.toString(), {
        nutrition: total,
        servings: dish.servings ?? 1
      });
    });

    const mealsWithNutrition = scheduleData.meals?.map(meal => ({
      ...meal,
      dishes: meal.dishes?.map(dish => {
        const dishId = dish.dishId?.toString();
        if (!dishId) {
          return {
            ...dish,
            nutrition: createEmptyDetailNutritionTotal()
          };
        }

        const detail = nutritionByDishId.get(dishId);
        if (!detail) {
          return {
            ...dish,
            nutrition: createEmptyDetailNutritionTotal()
          };
        }

        const scheduleServings = dish.servings ?? detail.servings;
        const factor =
          detail.servings > 0 ? scheduleServings / detail.servings : 1;

        return {
          ...dish,
          nutrition: scaleDetailNutrition(detail.nutrition, factor)
        };
      })
    }));

    return { ...scheduleData, meals: mealsWithNutrition };
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

    if (data.date) {
      data.date = ensureValidDate(data.date);
    }

    validateDishIds(data.meals);

    const updatedSchedule = await ScheduleModel.findByIdAndUpdate(id, data, {
      new: true
    });

    if (!updatedSchedule) {
      throw createHttpError(404, 'Không tìm thấy lịch ăn');
    }

    return updatedSchedule;
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

    const dishIds = new Set<string>();
    data.meals.forEach(meal => {
      meal.dishes?.forEach(dish => {
        if (!dish.dishId) {
          throw createHttpError(400, 'Dish ID is required');
        }
        dishIds.add(dish.dishId);
      });
    });

    const dishes = dishIds.size
      ? await DishModel.find({ _id: { $in: Array.from(dishIds) } })
          .select('name image servings ingredients')
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

          const baseCalories = calculateDishCalories(dishInfo);
          const recipeServings = dishInfo.servings ?? 1;
          const requestedServings = dish.servings ?? recipeServings;
          const caloriesPerServing =
            recipeServings > 0 ? baseCalories / recipeServings : baseCalories;
          const totalCalories = Math.round(
            caloriesPerServing * requestedServings
          );

          const dishPayload = {
            dishId: dishInfo._id,
            name: dishInfo.name,
            image: dishInfo.image,
            servings: requestedServings,
            calories: totalCalories,
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
