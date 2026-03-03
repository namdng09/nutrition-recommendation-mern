import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument } from 'mongoose';

import {
  DishModel,
  GroceryModel,
  IngredientModel
} from '~/shared/database/models';
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
    const existingIngredient = await IngredientModel.findOne({
      name: data.name
    });

    if (existingIngredient) {
      throw createHttpError(409, 'Nguyên liệu với tên này đã tồn tại');
    }

    const newIngredient = await IngredientModel.create(data);

    if (image) await saveIngredientImage(newIngredient, image);

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

    if (data.name) {
      const existingIngredient = await IngredientModel.findOne({
        name: data.name,
        _id: { $ne: id }
      });

      if (existingIngredient) {
        throw createHttpError(409, 'Nguyên liệu với tên này đã tồn tại');
      }
    }

    const updatedIngredient = await IngredientModel.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!updatedIngredient) {
      throw createHttpError(404, 'Không tìm thấy nguyên liệu');
    }

    if (image) await replaceIngredientImage(updatedIngredient, image);

    await cascadeIngredientSnapshot(updatedIngredient);

    return updatedIngredient;
  },

  deleteIngredient: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const ingredient = await IngredientModel.findById(id);

    if (!ingredient) {
      throw createHttpError(404, 'Không tìm thấy nguyên liệu');
    }

    await deleteImage(ingredient._id.toString());
    await ingredient.deleteOne();

    return ingredient;
  }
};

async function saveIngredientImage(
  ingredient: HydratedDocument<Ingredient>,
  file: Express.Multer.File
) {
  const uploadResult = await uploadImage(
    file.buffer,
    ingredient._id.toString()
  );

  if (uploadResult.success && uploadResult.data) {
    ingredient.image = uploadResult.data.secure_url;
    await ingredient.save();
  } else {
    throw createHttpError(500, 'Tải ảnh lên thất bại');
  }
}

async function replaceIngredientImage(
  ingredient: HydratedDocument<Ingredient>,
  file: Express.Multer.File
) {
  await deleteImage(ingredient._id.toString());
  await saveIngredientImage(ingredient, file);
}

async function cascadeIngredientSnapshot(
  ingredient: HydratedDocument<Ingredient>
) {
  const { _id, name, image, description, allergens } = ingredient;
  const query = { 'ingredients.ingredientId': _id };
  // elem = each array element where ingredientId matches; $[elem] targets all of them, not just the first
  const arrayFilters = [{ 'elem.ingredientId': _id }];

  await DishModel.updateMany(
    query,
    {
      $set: {
        'ingredients.$[elem].name': name,
        'ingredients.$[elem].image': image,
        'ingredients.$[elem].description': description,
        'ingredients.$[elem].allergens': allergens
      }
    },
    { arrayFilters }
  );

  await GroceryModel.updateMany(
    query,
    {
      $set: {
        'ingredients.$[elem].name': name,
        'ingredients.$[elem].image': image
      }
    },
    { arrayFilters }
  );
}
