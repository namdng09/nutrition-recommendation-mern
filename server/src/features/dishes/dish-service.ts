import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument, PaginateResult } from 'mongoose';

import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { ROLE } from '~/shared/constants/role';
import {
  CollectionModel,
  DishModel,
  IngredientModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import type { Dish } from '~/shared/database/models/dish-model';
import { eventBus } from '~/shared/events/event-bus';
import { EVENTS } from '~/shared/events/event-types';
import {
  buildPaginateOptions,
  deleteImage,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import type {
  CreateDishRequest,
  CreatePrivateDishRequest,
  UpdateDishRequest,
  UpdatePrivateDishRequest
} from './dish-dto';

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
      isPublic: data.isPublic
    });

    if (image) await saveDishImage(newDish, image);

    eventBus.emit(EVENTS.DISH_CREATED, {
      userId,
      dishId: newDish._id.toString()
    });

    return newDish;
  },

  viewDishes: async (
    parsed: QueryOptions,
    userId?: string
  ): Promise<PaginateResult<Dish>> => {
    const options = buildPaginateOptions(parsed);
    let filter = { ...((parsed.filter ?? {}) as Record<string, any>) };

    const includeBlocked = filter.includeBlocked === true;
    const favoritesOnly = filter.favoritesOnly === true;
    delete filter.includeBlocked;
    delete filter.favoritesOnly;

    let favoriteDishIds: Set<string> = new Set();

    if (favoritesOnly && !userId) {
      throw createHttpError(401, 'Cần đăng nhập để lọc món ăn yêu thích');
    }

    if (userId) {
      const user = await UserModel.findById(
        userId,
        'blockDishes favoriteDishes'
      ).lean();

      const favoriteDishIdList = (user?.favoriteDishes ?? []).map(id =>
        String(id)
      );
      favoriteDishIds = new Set(favoriteDishIdList);

      if (favoritesOnly) {
        filter = mergeIdScope(filter, { inIds: user?.favoriteDishes ?? [] });
      }

      if (!includeBlocked && user?.blockDishes?.length) {
        filter = mergeIdScope(filter, { ninIds: user.blockDishes });
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
    eventBus.emit(EVENTS.DISH_UPDATED, {
      userId,
      dishId: updatedDish._id.toString()
    });

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
    eventBus.emit(EVENTS.DISH_DELETED, {
      userId,
      dishId: dish._id.toString()
    });

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
    dishes.forEach(dish => {
      eventBus.emit(EVENTS.DISH_DELETED, {
        userId,
        dishId: dish._id.toString()
      });
    });

    return result;
  },

  createPrivateDish: async (
    userId: string,
    userName: string,
    data: CreatePrivateDishRequest,
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
      isPublic: false
    });

    if (image) await saveDishImage(newDish, image);

    eventBus.emit(EVENTS.DISH_CREATED, {
      userId,
      dishId: newDish._id.toString()
    });

    return newDish;
  },

  viewPrivateDishes: async (
    parsed: QueryOptions,
    userId: string
  ): Promise<PaginateResult<Dish>> => {
    const options = buildPaginateOptions(parsed);

    const filter = {
      ...parsed.filter,
      isPublic: false,
      'user._id': userId
    };

    return DishModel.paginate(filter, options);
  },

  viewPrivateDishDetail: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }
    if (dish.isPublic) {
      throw createHttpError(403, 'Món ăn này không phải là món ăn riêng tư');
    }
    if (dish.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xem món ăn riêng tư này');
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

    return { ...dishObj, ingredients };
  },

  updatePrivateDish: async (
    id: string,
    userId: string,
    data: UpdatePrivateDishRequest,
    image?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const existingDish = await DishModel.findById(id);
    if (!existingDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }
    if (existingDish.isPublic || existingDish.user?._id.toString() !== userId) {
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
    const updateData: Record<string, unknown> = { ...rest, isPublic: false };

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

  deletePrivateDish: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }
    if (dish.isPublic || dish.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xóa món ăn này');
    }

    if (dish.image) await deleteImage(dish._id.toString());
    await dish.deleteOne();

    return dish;
  }
};

function mergeIdScope(
  filter: Record<string, any>,
  scope: { inIds?: unknown[]; ninIds?: unknown[] }
) {
  const inIds = scope.inIds ?? [];
  const ninIds = scope.ninIds ?? [];
  const hasInScope = Object.prototype.hasOwnProperty.call(scope, 'inIds');
  const hasNinScope = Object.prototype.hasOwnProperty.call(scope, 'ninIds');
  const currentIdFilter = filter._id;

  let nextIdFilter: Record<string, unknown>;
  if (
    currentIdFilter &&
    typeof currentIdFilter === 'object' &&
    !Array.isArray(currentIdFilter)
  ) {
    nextIdFilter = { ...currentIdFilter };
  } else if (typeof currentIdFilter !== 'undefined') {
    nextIdFilter = { $eq: currentIdFilter };
  } else {
    nextIdFilter = {};
  }

  if (hasInScope) {
    if (Array.isArray(nextIdFilter.$in)) {
      nextIdFilter.$in = intersectIds(nextIdFilter.$in as unknown[], inIds);
    } else {
      nextIdFilter.$in = inIds;
    }
  }

  if (hasNinScope && ninIds.length > 0) {
    if (Array.isArray(nextIdFilter.$nin)) {
      nextIdFilter.$nin = uniqByString([
        ...(nextIdFilter.$nin as unknown[]),
        ...ninIds
      ]);
    } else {
      nextIdFilter.$nin = ninIds;
    }
  }

  return { ...filter, _id: nextIdFilter };
}

function intersectIds(idsA: unknown[], idsB: unknown[]) {
  const allowed = new Set(idsB.map(id => String(id)));
  return idsA.filter(id => allowed.has(String(id)));
}

function uniqByString(ids: unknown[]) {
  const seen = new Set<string>();
  return ids.filter(id => {
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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
