import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import {
  DishModel,
  GroceryModel,
  IngredientModel,
  ScheduleModel
} from '~/shared/database/models';
import type { Grocery } from '~/shared/database/models/grocery-model';
import {
  buildPaginateOptions,
  type PaginateResponse,
  validateObjectId
} from '~/shared/utils';

import {
  AddIngredientsRequest,
  CreateGroceryRequest,
  RemoveIngredientsRequest,
  UpdateGroceryRequest,
  UpdateIngredientInGroceryRequest
} from './grocery-dto';

type GroceryIngredient = {
  ingredientId: string;
  name: string;
  image: string;
  isPurchased: boolean;
};

const buildIngredientsFromDates = async (
  userId: string,
  dates: Date[]
): Promise<GroceryIngredient[]> => {
  if (dates.length === 0) return [];

  const dateFilters = dates.map(date => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { date: { $gte: start, $lte: end } };
  });

  const schedules = await ScheduleModel.find({
    'user._id': userId,
    $or: dateFilters
  }).select({ meals: 1 });

  const dishIds = new Set<string>();
  schedules.forEach(schedule => {
    schedule.meals?.forEach(meal => {
      meal.dishes?.forEach(dish => {
        const dishId = dish.dishId?.toString();
        if (dishId) {
          dishIds.add(dishId);
        }
      });
    });
  });

  if (dishIds.size === 0) return [];

  const dishes = await DishModel.find({
    _id: { $in: Array.from(dishIds) }
  }).select({ ingredients: 1 });

  const ingredientMap = new Map<string, GroceryIngredient>();
  dishes.forEach(dish => {
    dish.ingredients?.forEach(ingredient => {
      const ingredientId = ingredient.ingredientId?.toString();
      if (!ingredientId || ingredientMap.has(ingredientId)) {
        return;
      }
      ingredientMap.set(ingredientId, {
        ingredientId,
        name: ingredient.name,
        image: ingredient.image ?? '',
        isPurchased: false
      });
    });
  });

  return Array.from(ingredientMap.values());
};

export const GroceryService = {
  createGrocery: async (
    userId: string,
    userName: string,
    data: CreateGroceryRequest
  ) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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
    data: AddIngredientsRequest
  ) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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

    const ingredientIds = data.ingredients;
    const uniqueIds = new Set(ingredientIds);
    if (ingredientIds.length !== uniqueIds.size) {
      throw createHttpError(
        400,
        'Không được có nguyên liệu trùng lặp trong danh sách'
      );
    }

    ingredientIds.forEach(id => {
      if (!validateObjectId(id)) {
        throw createHttpError(400, `ID nguyên liệu không hợp lệ: ${id}`);
      }
    });

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

    const ingredientDetails = ingredients.map(ingredient => ({
      ingredientId: ingredient._id.toString(),
      name: ingredient.name,
      image: ingredient.image ?? '',
      isPurchased: false
    }));

    // Check for duplicates and merge or add new ingredients
    for (const newIng of ingredientDetails) {
      const existingIndex = grocery.ingredients.findIndex(
        item => item.ingredientId?.toString() === newIng.ingredientId.toString()
      );

      if (existingIndex !== -1) {
        if (newIng.isPurchased !== undefined) {
          grocery.ingredients[existingIndex].isPurchased = newIng.isPurchased;
        }
      } else {
        // Add new ingredient
        grocery.ingredients.push(newIng);
      }
    }

    await grocery.save();

    return grocery;
  },

  updateIngredientInGrocery: async (
    userId: string,
    groceryId: string,
    ingredientId: string,
    data: UpdateIngredientInGroceryRequest
  ) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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
    data: RemoveIngredientsRequest
  ) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

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

    // Check for duplicate ingredientId in request
    const uniqueIds = new Set(data.ingredients);
    if (data.ingredients.length !== uniqueIds.size) {
      throw createHttpError(
        400,
        'Không được có ID nguyên liệu trùng lặp trong danh sách'
      );
    }

    // Remove ingredients by filtering
    for (let i = grocery.ingredients.length - 1; i >= 0; i--) {
      if (
        data.ingredients.includes(
          grocery.ingredients[i].ingredientId?.toString() || ''
        )
      ) {
        grocery.ingredients.splice(i, 1);
      }
    }

    await grocery.save();

    return grocery;
  }
};
