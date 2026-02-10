import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { GroceryModel, IngredientModel } from '~/shared/database/models';
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
  UpdateIngredientsInGroceryRequest
} from './grocery-dto';

export const GroceryService = {
  createGrocery: async (
    userId: string,
    userName: string,
    data: CreateGroceryRequest
  ) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    // Check for duplicate ingredientId in request
    const ingredientIds = data.ingredients.map(ing => ing.ingredientId);
    const uniqueIds = new Set(ingredientIds);
    if (ingredientIds.length !== uniqueIds.size) {
      throw createHttpError(
        400,
        'Không được có nguyên liệu trùng lặp trong danh sách'
      );
    }

    // Validate and fetch ingredient details
    const ingredientDetails = await Promise.all(
      data.ingredients.map(async ing => {
        if (!validateObjectId(ing.ingredientId)) {
          throw createHttpError(
            400,
            `ID nguyên liệu không hợp lệ: ${ing.ingredientId}`
          );
        }

        const ingredient = await IngredientModel.findById(ing.ingredientId);
        if (!ingredient) {
          throw createHttpError(
            404,
            `Không tìm thấy nguyên liệu với ID: ${ing.ingredientId}`
          );
        }

        return {
          ingredientId: ingredient._id,
          name: ingredient.name,
          image: ingredient.image ?? '',
          isPurchased: ing.isPurchased ?? false,
          notes: ing.notes
        };
      })
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
    id: string,
    data: UpdateGroceryRequest
  ) => {
    if (!validateObjectId(userId)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID danh sách mua sắm không hợp lệ');
    }

    if (data.endDate && !data.startDate) {
      const currentGrocery = await GroceryModel.findOne({
        _id: id,
        'user._id': userId
      }).select({ startDate: 1 });

      if (!currentGrocery) {
        throw createHttpError(404, 'Không tìm thấy danh sách mua sắm');
      }

      if (data.endDate < currentGrocery.startDate) {
        throw createHttpError(
          400,
          'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu'
        );
      }
    }

    const updateData: any = { ...data };

    // If ingredients are updated, fetch their details
    if (data.ingredients) {
      const ingredientDetails = await Promise.all(
        data.ingredients.map(async ing => {
          if (!validateObjectId(ing.ingredientId)) {
            throw createHttpError(
              400,
              `ID nguyên liệu không hợp lệ: ${ing.ingredientId}`
            );
          }

          const ingredient = await IngredientModel.findById(ing.ingredientId);
          if (!ingredient) {
            throw createHttpError(
              404,
              `Không tìm thấy nguyên liệu với ID: ${ing.ingredientId}`
            );
          }

          return {
            ingredientId: ingredient._id,
            name: ingredient.name,
            image: ingredient.image ?? '',
            isPurchased: ing.isPurchased ?? false,
            notes: ing.notes
          };
        })
      );

      updateData.ingredients = ingredientDetails;
    }

    const updatedGrocery = await GroceryModel.findOneAndUpdate(
      {
        _id: id,
        'user._id': userId
      },
      updateData,
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

    // Check for duplicate ingredientId in request
    const ingredientIds = data.ingredients.map(ing => ing.ingredientId);
    const uniqueIds = new Set(ingredientIds);
    if (ingredientIds.length !== uniqueIds.size) {
      throw createHttpError(
        400,
        'Không được có nguyên liệu trùng lặp trong danh sách'
      );
    }

    // Validate and fetch ingredient details
    const ingredientDetails = await Promise.all(
      data.ingredients.map(async ing => {
        if (!validateObjectId(ing.ingredientId)) {
          throw createHttpError(
            400,
            `ID nguyên liệu không hợp lệ: ${ing.ingredientId}`
          );
        }

        const ingredient = await IngredientModel.findById(ing.ingredientId);
        if (!ingredient) {
          throw createHttpError(
            404,
            `Không tìm thấy nguyên liệu với ID: ${ing.ingredientId}`
          );
        }

        return {
          ingredientId: ingredient._id,
          name: ingredient.name,
          image: ingredient.image ?? '',
          isPurchased: ing.isPurchased ?? false,
          notes: ing.notes
        };
      })
    );

    // Check for duplicates and merge or add new ingredients
    for (const newIng of ingredientDetails) {
      const existingIndex = grocery.ingredients.findIndex(
        item => item.ingredientId?.toString() === newIng.ingredientId.toString()
      );

      if (existingIndex !== -1) {
        // Ingredient already exists, update notes if provided
        if (newIng.notes) {
          grocery.ingredients[existingIndex].notes = newIng.notes;
        }
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

  updateIngredientsInGrocery: async (
    userId: string,
    groceryId: string,
    data: UpdateIngredientsInGroceryRequest
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
    const ingredientIds = data.ingredients.map(ing => ing.ingredientId);
    const uniqueIds = new Set(ingredientIds);
    if (ingredientIds.length !== uniqueIds.size) {
      throw createHttpError(
        400,
        'Không được có nguyên liệu trùng lặp trong danh sách cập nhật'
      );
    }

    // Update multiple ingredients
    for (const ing of data.ingredients) {
      const ingredientIndex = grocery.ingredients.findIndex(
        item => item.ingredientId?.toString() === ing.ingredientId
      );

      if (ingredientIndex === -1) {
        throw createHttpError(
          404,
          `Không tìm thấy nguyên liệu với ID: ${ing.ingredientId} trong danh sách mua sắm`
        );
      }

      // Update fields if provided
      if (ing.isPurchased !== undefined) {
        grocery.ingredients[ingredientIndex].isPurchased = ing.isPurchased;
      }
      if (ing.notes !== undefined) {
        grocery.ingredients[ingredientIndex].notes = ing.notes;
      }
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
