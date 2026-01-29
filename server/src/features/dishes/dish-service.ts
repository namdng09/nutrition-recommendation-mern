import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { DishModel, IngredientModel } from '~/shared/database/models';
import type { Dish } from '~/shared/database/models/dish-model';
import { ROLE } from '~/shared/constants/role';
import {
  buildPaginateOptions,
  deleteImage,
  type PaginateResponse,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import { CreateDishRequest, UpdateDishRequest } from './dish-dto';

export const DishService = {
  createDish: async (
    userId: string,
    userName: string,
    data: CreateDishRequest,
    image?: Express.Multer.File
  ) => {
    // Validate and fetch ingredient details
    const ingredientDetails = await Promise.all(
      data.ingredients.map(async (ing) => {
        if (!validateObjectId(ing.ingredientId)) {
          throw createHttpError(400, `ID nguyên liệu không hợp lệ: ${ing.ingredientId}`);
        }

        const ingredient = await IngredientModel.findById(ing.ingredientId);
        if (!ingredient) {
          throw createHttpError(404, `Không tìm thấy nguyên liệu với ID: ${ing.ingredientId}`);
        }

        return {
          ingredientId: ingredient._id,
          name: ingredient.name,
          image: ingredient.image || '',
          description: ingredient.description,
          nutrients: ingredient.nutrition?.nutrients,
          allergens: ingredient.allergens,
          baseUnit: ingredient.baseUnit,
          units: ing.units
        };
      })
    );

    const newDish = await DishModel.create({
      user: {
        _id: userId,
        name: userName
      },
      name: data.name,
      description: data.description,
      categories: data.categories,
      ingredients: ingredientDetails,
      instructions: data.instructions,
      preparationTime: data.preparationTime,
      cookTime: data.cookTime,
      servings: data.servings || 1,
      tags: data.tags,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? false
    });

    if (!newDish) {
      throw createHttpError(500, 'Tạo món ăn thất bại');
    }

    if (image) {
      const uploadResult = await uploadImage(image.buffer, newDish._id.toString());
      if (uploadResult.success && uploadResult.data) {
        newDish.image = uploadResult.data.secure_url;
        await newDish.save();
      } else {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }
    }

    return newDish;
  },

  viewDishes: async (parsed: QueryOptions): Promise<PaginateResponse<Dish>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await DishModel.paginate(filter, options);

    return result as unknown as PaginateResponse<Dish>;
  },

  viewDishDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);

    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    return dish;
  },

  updateDish: async (
    id: string,
    userId: string,
    data: UpdateDishRequest,
    image?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const existingDish = await DishModel.findById(id);
    if (!existingDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    // Check ownership
    if (existingDish.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật món ăn này');
    }

    const updateData: any = { ...data };

    // If ingredients are updated, fetch their details
    if (data.ingredients) {
      const ingredientDetails = await Promise.all(
        data.ingredients.map(async (ing) => {
          if (!validateObjectId(ing.ingredientId)) {
            throw createHttpError(400, `ID nguyên liệu không hợp lệ: ${ing.ingredientId}`);
          }

          const ingredient = await IngredientModel.findById(ing.ingredientId);
          if (!ingredient) {
            throw createHttpError(404, `Không tìm thấy nguyên liệu với ID: ${ing.ingredientId}`);
          }

          return {
            ingredientId: ingredient._id,
            name: ingredient.name,
            image: ingredient.image || '',
            description: ingredient.description,
            nutrients: ingredient.nutrition?.nutrients,
            allergens: ingredient.allergens,
            baseUnit: ingredient.baseUnit,
            units: ing.units
          };
        })
      );
      updateData.ingredients = ingredientDetails;
    }

    const updatedDish = await DishModel.findByIdAndUpdate(id, updateData, {
      new: true
    });

    if (!updatedDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (image) {
      await deleteImage(updatedDish._id.toString());

      const uploadResult = await uploadImage(image.buffer, updatedDish._id.toString());
      if (uploadResult.success && uploadResult.data) {
        updatedDish.image = uploadResult.data.secure_url;
        await updatedDish.save();
      } else {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }
    }

    return updatedDish;
  },

  deleteDish: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    const deletedDish = await DishModel.findByIdAndDelete(id);

    if (!deletedDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (deletedDish.image) {
      await deleteImage(deletedDish._id.toString());
    }

    return deletedDish;
  }
};
