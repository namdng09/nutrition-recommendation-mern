import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument } from 'mongoose';

import {
  DishModel,
  GroceryModel,
  IngredientModel,
  ScheduleModel
} from '~/shared/database/models';
import type { Dish } from '~/shared/database/models/dish-model';
import type { Grocery } from '~/shared/database/models/grocery-model';
import type { Schedule } from '~/shared/database/models/schedule-model';
import {
  buildPaginateOptions,
  type PaginateResponse,
  validateObjectId
} from '~/shared/utils';

import {
  AddGroceryIngredientRequest,
  CreateGroceryRequest,
  RemoveGroceryIngredientRequest,
  UpdateGroceryIngredientRequest,
  UpdateGroceryRequest
} from './grocery-dto';

type GroceryIngredient = {
  ingredientId: string;
  name: string;
  image: string;
  isPurchased: boolean;
};

export const GroceryService = {
  createGrocery: async (
    userId: string,
    userName: string,
    data: CreateGroceryRequest
  ) => {
    const selectedDates = data.date ?? [];
    const ingredientDetails = await buildIngredientsFromDates(
      userId,
      selectedDates
    );

    const newGrocery = await GroceryModel.create({
      ...data,
      user: {
        _id: userId,
        name: userName
      },
      ingredients: ingredientDetails
    });

    if (!newGrocery) {
      throw createHttpError(500, 'Tạo danh sách mua sắm thất bại');
    }

    return newGrocery;
  },

  viewGroceries: async (
    userId: string,
    parsed: QueryOptions
  ): Promise<PaginateResponse<Grocery>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    // Filter by user
    const userFilter = {
      ...filter,
      'user._id': userId
    };

    const result = await GroceryModel.paginate(userFilter, options);

    return result as unknown as PaginateResponse<Grocery>;
  },

  viewGroceryDetail: async (userId: string, id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID danh sách mua sắm không hợp lệ');
    }

    const grocery = await GroceryModel.findOne({
      _id: id,
      'user._id': userId
    });

    if (!grocery) {
      throw createHttpError(404, 'Không tìm thấy danh sách mua sắm');
    }

    return grocery;
  },

  updateGrocery: async (
    userId: string,
    groceryId: string,
    data: UpdateGroceryRequest
  ) => {
    if (!validateObjectId(groceryId)) {
      throw createHttpError(400, 'Định dạng ID danh sách mua sắm không hợp lệ');
    }

    const updatedGrocery = await GroceryModel.findOneAndUpdate(
      {
        _id: groceryId,
        'user._id': userId
      },
      data,
      {
        new: true
      }
    );

    if (!updatedGrocery) {
      throw createHttpError(404, 'Không tìm thấy danh sách mua sắm');
    }

    return updatedGrocery;
  },

  deleteGrocery: async (userId: string, id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID danh sách mua sắm không hợp lệ');
    }

    const deletedGrocery = await GroceryModel.findOneAndDelete({
      _id: id,
      'user._id': userId
    });

    if (!deletedGrocery) {
      throw createHttpError(404, 'Không tìm thấy danh sách mua sắm');
    }

    return deletedGrocery;
  },

  addIngredientsInGrocery: async (
    userId: string,
    groceryId: string,
    data: AddGroceryIngredientRequest
  ) => {
    if (!validateObjectId(groceryId)) {
      throw createHttpError(400, 'Định dạng ID danh sách mua sắm không hợp lệ');
    }

    const grocery = await GroceryModel.findOne({
      _id: groceryId,
      'user._id': userId
    });

    if (!grocery) {
      throw createHttpError(404, 'Không tìm thấy danh sách mua sắm');
    }

    const uniqueIds = new Set(data.ingredients);
    if (data.ingredients.length !== uniqueIds.size) {
      throw createHttpError(
        400,
        'Không được có nguyên liệu trùng lặp trong danh sách'
      );
    }

    const ingredientDetails = await resolveIngredientSnapshots(
      data.ingredients
    );

    for (const ing of ingredientDetails) {
      const existing = grocery.ingredients.find(
        item => item.ingredientId?.toString() === ing.ingredientId
      );
      if (existing) {
        existing.isPurchased = ing.isPurchased;
      } else {
        grocery.ingredients.push(ing);
      }
    }
    await grocery.save();

    return grocery;
  },

  updateIngredientInGrocery: async (
    userId: string,
    groceryId: string,
    ingredientId: string,
    data: UpdateGroceryIngredientRequest
  ) => {
    if (!validateObjectId(groceryId)) {
      throw createHttpError(400, 'Định dạng ID danh sách mua sắm không hợp lệ');
    }

    if (!validateObjectId(ingredientId)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const grocery = await GroceryModel.findOne({
      _id: groceryId,
      'user._id': userId
    });

    if (!grocery) {
      throw createHttpError(404, 'Không tìm thấy danh sách mua sắm');
    }

    const ingredientIndex = grocery.ingredients.findIndex(
      item => item.ingredientId?.toString() === ingredientId
    );

    if (ingredientIndex === -1) {
      throw createHttpError(
        404,
        `Không tìm thấy nguyên liệu với ID: ${ingredientId} trong danh sách mua sắm`
      );
    }

    if (data.isPurchased !== undefined) {
      grocery.ingredients[ingredientIndex].isPurchased = data.isPurchased;
    }

    await grocery.save();

    return grocery;
  },

  removeIngredientsInGrocery: async (
    userId: string,
    groceryId: string,
    data: RemoveGroceryIngredientRequest
  ) => {
    if (!validateObjectId(groceryId)) {
      throw createHttpError(400, 'Định dạng ID danh sách mua sắm không hợp lệ');
    }

    const grocery = await GroceryModel.findOne({
      _id: groceryId,
      'user._id': userId
    });

    if (!grocery) {
      throw createHttpError(404, 'Không tìm thấy danh sách mua sắm');
    }

    const initialCount = grocery.ingredients.length;

    grocery.set(
      'ingredients',
      grocery.ingredients.filter(
        ing => !data.ingredients.includes(ing.ingredientId?.toString() ?? '')
      )
    );

    if (grocery.ingredients.length === initialCount) {
      throw createHttpError(
        404,
        'Không tìm thấy nguyên liệu nào trong danh sách mua sắm'
      );
    }

    await grocery.save();

    return grocery;
  }
};

async function resolveIngredientSnapshots(
  ingredientIds: string[]
): Promise<GroceryIngredient[]> {
  for (const id of ingredientIds) {
    if (!validateObjectId(id)) {
      throw createHttpError(400, `ID nguyên liệu không hợp lệ: ${id}`);
    }
  }

  const ingredients = await IngredientModel.find({
    _id: { $in: ingredientIds }
  });

  if (ingredients.length !== ingredientIds.length) {
    const foundIds = new Set(ingredients.map(item => item._id.toString()));
    const missingId = ingredientIds.find(id => !foundIds.has(id));
    throw createHttpError(
      404,
      `Không tìm thấy nguyên liệu với ID: ${missingId}`
    );
  }

  return ingredients.map(ingredient => ({
    ingredientId: ingredient._id.toString(),
    name: ingredient.name,
    image: ingredient.image ?? '',
    isPurchased: false
  }));
}

async function buildIngredientsFromDates(
  userId: string,
  dates: Date[]
): Promise<GroceryIngredient[]> {
  if (dates.length === 0) return [];

  const schedules = await ScheduleModel.find({
    'user._id': userId,
    $or: buildDateRangeFilters(dates)
  }).select({ meals: 1 });

  const dishIds = collectDishIds(schedules);
  if (dishIds.length === 0) return [];

  const dishes = await DishModel.find({
    _id: { $in: dishIds }
  }).select({ ingredients: 1 });

  return collectIngredientSnapshots(dishes);
}

function buildDateRangeFilters(dates: Date[]) {
  return dates.map(date => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { date: { $gte: start, $lte: end } };
  });
}

function collectDishIds(schedules: HydratedDocument<Schedule>[]): string[] {
  const dishIds = new Set<string>();
  schedules.forEach(schedule => {
    schedule.meals?.forEach(meal => {
      meal.dishes?.forEach(dish => {
        const dishId = dish.dishId?.toString();
        if (dishId) dishIds.add(dishId);
      });
    });
  });
  return Array.from(dishIds);
}

function collectIngredientSnapshots(
  dishes: HydratedDocument<Dish>[]
): GroceryIngredient[] {
  const ingredientMap = new Map<string, GroceryIngredient>();
  dishes.forEach(dish => {
    dish.ingredients?.forEach(ingredient => {
      const ingredientId = ingredient.ingredientId?.toString();
      if (!ingredientId || ingredientMap.has(ingredientId)) return;
      ingredientMap.set(ingredientId, {
        ingredientId,
        name: ingredient.name,
        image: ingredient.image ?? '',
        isPurchased: false
      });
    });
  });
  return Array.from(ingredientMap.values());
}
