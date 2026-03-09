import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument, PaginateResult } from 'mongoose';

import { ROLE } from '~/shared/constants/role';
import {
  CollectionModel,
  DishModel,
  IngredientModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import type { Dish } from '~/shared/database/models/dish-model';
import {
  buildPaginateOptions,
  deleteImage,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import type { CreateDishRequest, UpdateDishRequest } from './dish-dto';

export const DishService = {
  createDish: async (
    userId: string,
    userName: string,
    data: CreateDishRequest,
    image?: Express.Multer.File
  ) => {
    const existingDish = await DishModel.findOne({ name: data.name });
    if (existingDish) {
      throw createHttpError(409, 'Món ăn với tên này đã tồn tại');
    }

    const ingredients = await resolveIngredientSnapshots(data.ingredients);

    const newDish = await DishModel.create({
      user: { _id: userId, name: userName },
      name: data.name,
      description: data.description,
      categories: data.categories,
      nutritionFocus: data.nutritionFocus,
      ingredients,
      instructions: data.instructions,
      nutrition: data.nutrition,
      preparationTime: data.preparationTime,
      cookTime: data.cookTime,
      servings: data.servings || 1,
      tags: data.tags,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? false
    });

    if (image) await saveDishImage(newDish, image);

    return newDish;
  },

  viewDishes: async (
    parsed: QueryOptions,
    userId?: string
  ): Promise<PaginateResult<Dish>> => {
    const options = buildPaginateOptions(parsed);
    let { filter } = parsed;

    let favoriteDishIds: Set<string> = new Set();

    if (userId) {
      const user = await UserModel.findById(
        userId,
        'blockDishes favoriteDishes'
      ).lean();

      if (user?.blockDishes?.length) {
        filter = { ...filter, _id: { $nin: user.blockDishes } };
      }

      if (user?.favoriteDishes?.length) {
        favoriteDishIds = new Set(
          user.favoriteDishes.map((id: unknown) => String(id))
        );
      }
    }

    const result = await DishModel.paginate(filter, options);

    result.docs = result.docs.map(doc => ({
      ...((doc as any).toObject?.() ?? doc),
      isFavorited: favoriteDishIds.has(String((doc as any)._id))
    })) as any;

    return result;
  },

  viewDishDetail: async (id: string, userId?: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    const ingredientIds = dish.ingredients.map(i => i.ingredientId);
    const found = await IngredientModel.find(
      { _id: { $in: ingredientIds } },
      { _id: 1 }
    ).lean();
    const existingIds = new Set(found.map(i => i._id.toString()));

    const dishObj = dish.toObject();
    const ingredients = dishObj.ingredients.map(ing => {
      const isDeleted =
        !ing.ingredientId || !existingIds.has(ing.ingredientId.toString());
      return { ...ing, isDeleted };
    });

    let isFavorited = false;
    if (userId) {
      const user = await UserModel.findById(userId, 'favoriteDishes').lean();
      isFavorited =
        user?.favoriteDishes?.some(fId => String(fId) === id) ?? false;
    }

    return { ...dishObj, ingredients, isFavorited };
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

    if (existingDish.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật món ăn này');
    }

    if (data.name) {
      const duplicate = await DishModel.findOne({
        name: data.name,
        _id: { $ne: id }
      });
      if (duplicate) {
        throw createHttpError(409, 'Món ăn với tên này đã tồn tại');
      }
    }

    const { ingredients: _ingredients, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };

    if (data.ingredients) {
      updateData.ingredients = await resolveIngredientSnapshots(
        data.ingredients
      );
    }

    const updatedDish = await DishModel.findByIdAndUpdate(id, updateData, {
      new: true
    });

    if (!updatedDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (image) await replaceDishImage(updatedDish, image);

    await cascadeDishSnapshot(updatedDish);

    return updatedDish;
  },

  deleteDish: async (id: string, userId: string, userRole: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    const isOwner = dish.user?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    if (!isOwner && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền xóa món ăn này');
    }

    if (dish.image) await deleteImage(dish._id.toString());
    await dish.deleteOne();

    return dish;
  },

  deleteBulk: async (ids: string[], userId: string, userRole: string) => {
    ids.forEach(id => {
      if (!validateObjectId(id)) {
        throw createHttpError(400, `Định dạng ID món ăn không hợp lệ: ${id}`);
      }
    });

    const dishes = await DishModel.find({ _id: { $in: ids } });

    const isAdmin = userRole === ROLE.ADMIN;

    if (!isAdmin) {
      const unauthorized = dishes.find(d => d.user?._id.toString() !== userId);
      if (unauthorized) {
        throw createHttpError(403, 'Bạn không có quyền xóa một số món ăn này');
      }
    }

    await Promise.all(
      dishes.map(d =>
        d.image ? deleteImage(d._id.toString()) : Promise.resolve()
      )
    );

    const result = await DishModel.deleteMany({ _id: { $in: ids } });

    return result;
  }
};

async function resolveIngredientSnapshots(
  items: CreateDishRequest['ingredients']
) {
  return Promise.all(
    items.map(async ing => {
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
        image: ingredient.image || '',
        description: ingredient.description,
        allergens: ingredient.allergens,
        baseUnit: ingredient.baseUnit,
        units: ing.units
      };
    })
  );
}

async function saveDishImage(
  dish: HydratedDocument<Dish>,
  file: Express.Multer.File
) {
  const uploadResult = await uploadImage(file.buffer, dish._id.toString());

  if (uploadResult.success && uploadResult.data) {
    dish.image = uploadResult.data.secure_url;
    await dish.save();
  } else {
    throw createHttpError(500, 'Tải ảnh lên thất bại');
  }
}

async function replaceDishImage(
  dish: HydratedDocument<Dish>,
  file: Express.Multer.File
) {
  await deleteImage(dish._id.toString());
  await saveDishImage(dish, file);
}

async function cascadeDishSnapshot(dish: HydratedDocument<Dish>) {
  const { _id, name, image } = dish;
  const query = { 'dishes.dishId': _id };
  const arrayFilters = [{ 'elem.dishId': _id }];

  await CollectionModel.updateMany(
    query,
    {
      $set: {
        'dishes.$[elem].name': name,
        'dishes.$[elem].image': image
      }
    },
    { arrayFilters }
  );

  await ScheduleModel.updateMany(
    { 'meals.dishes.dishId': _id },
    {
      $set: {
        'meals.$[].dishes.$[elem].name': name,
        'meals.$[].dishes.$[elem].image': image
      }
    },
    { arrayFilters }
  );
}
