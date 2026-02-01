import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { IngredientModel } from '~/shared/database/models';
import type { Ingredient } from '~/shared/database/models/ingredient-model';
import {
  buildPaginateOptions,
  deleteImage,
  type PaginateResponse,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import {
  CreateIngredientRequest,
  UpdateIngredientRequest
} from './ingredient-dto';

export const IngredientService = {
  createIngredient: async (
    data: CreateIngredientRequest,
    image?: Express.Multer.File
  ) => {
    const newIngredient = await IngredientModel.create(data);
    if (!newIngredient) {
      throw createHttpError(500, 'Tạo nguyên liệu thất bại');
    }

    if (image) {
      const uploadResult = await uploadImage(
        image.buffer,
        newIngredient._id.toString()
      );
      if (uploadResult.success && uploadResult.data) {
        newIngredient.image = uploadResult.data.secure_url;
        await newIngredient.save();
      } else {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }
    }

    return newIngredient;
  },

  viewIngredients: async (
    parsed: QueryOptions
  ): Promise<PaginateResponse<Ingredient>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await IngredientModel.paginate(filter, options);

    return result as unknown as PaginateResponse<Ingredient>;
  },

  viewIngredientDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const ingredient = await IngredientModel.findById(id);

    if (!ingredient) {
      throw createHttpError(404, 'Không tìm thấy nguyên liệu');
    }

    return ingredient;
  },

  updateIngredient: async (
    id: string,
    data: UpdateIngredientRequest,
    image?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const updatedIngredient = await IngredientModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true
      }
    );

    if (!updatedIngredient) {
      throw createHttpError(404, 'Không tìm thấy nguyên liệu');
    }

    if (image) {
      await deleteImage(updatedIngredient._id.toString());

      const uploadResult = await uploadImage(
        image.buffer,
        updatedIngredient._id.toString()
      );
      if (uploadResult.success && uploadResult.data) {
        updatedIngredient.image = uploadResult.data.secure_url;
        await updatedIngredient.save();
      } else {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }
    }

    return updatedIngredient;
  },

  deleteIngredient: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const deletedIngredient = await IngredientModel.findByIdAndDelete(id);

    if (!deletedIngredient) {
      throw createHttpError(404, 'Không tìm thấy nguyên liệu');
    }

    await deleteImage(deletedIngredient._id.toString());

    return deletedIngredient;
  }
};
