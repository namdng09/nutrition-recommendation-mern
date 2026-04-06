import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument, PaginateResult } from 'mongoose';

import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { ROLE } from '~/shared/constants/role';
import {
  CollectionModel,
  DishModel,
  IngredientModel,
  ReviewModel,
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
  },

  createPrivateDish: async (
    userId: string,
    userName: string,
    data: CreatePrivateDishRequest,
    image?: Express.Multer.File
  ) => {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }
    if (user.role !== ROLE.USER) {
      throw createHttpError(
        403,
        'Chỉ người dùng mới có thể tạo món ăn riêng tư'
      );
    }

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

    await createPrivateDishReviewThread(newDish._id.toString(), userId);

    return newDish;
  },

  viewPrivateDishes: async (
    parsed: QueryOptions,
    userId: string
  ): Promise<PaginateResult<Dish>> => {
    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }
    if (user.role !== ROLE.USER) {
      throw createHttpError(
        403,
        'Chỉ người dùng mới có thể xem món ăn riêng tư'
      );
    }

    const options = buildPaginateOptions(parsed);
    let { filter } = parsed;

    filter = { ...filter, isPublic: false, 'user._id': userId };

    let favoriteDishIds: Set<string> = new Set();

    const userWithPreferences = await UserModel.findById(
      userId,
      'blockDishes favoriteDishes'
    ).lean();

    if (userWithPreferences?.blockDishes?.length) {
      filter = { ...filter, _id: { $nin: userWithPreferences.blockDishes } };
    }

    if (userWithPreferences?.favoriteDishes?.length) {
      favoriteDishIds = new Set(
        userWithPreferences.favoriteDishes.map((id: unknown) => String(id))
      );
    }

    const result = await DishModel.paginate(filter, options);

    result.docs = result.docs.map(doc => ({
      ...((doc as any).toObject?.() ?? doc),
      isFavorited: favoriteDishIds.has(String((doc as any)._id))
    })) as any;

    return result;
  },

  viewPrivateDishDetail: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const user = await UserModel.findById(userId, 'role favoriteDishes').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }
    if (user.role !== ROLE.USER) {
      throw createHttpError(
        403,
        'Chỉ người dùng mới có thể xem món ăn riêng tư'
      );
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }
    if (dish.isPublic || dish.user?._id.toString() !== userId) {
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

    const isFavorited =
      user.favoriteDishes?.some(fId => String(fId) === id) ?? false;

    return { ...dishObj, ingredients, isFavorited };
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

    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }
    if (user.role !== ROLE.USER) {
      throw createHttpError(
        403,
        'Chỉ người dùng mới có thể cập nhật món ăn riêng tư'
      );
    }

    const existingDish = await DishModel.findById(id);
    if (!existingDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }
    if (existingDish.isPublic || existingDish.user?._id.toString() !== userId) {
      throw createHttpError(
        403,
        'Bạn không có quyền cập nhật món ăn riêng tư này'
      );
    }

    await ensurePrivateDishEditable(id, userId);

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

    // Reset review status to DRAFT if user edits after submission
    await resetReviewStatusToDraft(id, userId);

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

    const user = await UserModel.findById(userId, 'role').lean();
    if (!user) {
      throw createHttpError(404, 'Người dùng không tồn tại');
    }
    if (user.role !== ROLE.USER) {
      throw createHttpError(
        403,
        'Chỉ người dùng mới có thể xóa món ăn riêng tư'
      );
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }
    if (dish.isPublic || dish.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xóa món ăn riêng tư này');
    }

    // Only allow delete for DRAFT, PENDING and REJECTED status
    await ensurePrivateDishDeletable(id, userId);

    if (dish.image) await deleteImage(dish._id.toString());
    await dish.deleteOne();

    // Delete associated review thread
    await ReviewModel.deleteOne({ dishId: id, userId });

    return dish;
  }
};

async function createPrivateDishReviewThread(dishId: string, userId: string) {
  const existingThread = await ReviewModel.findOne({ dishId, userId });
  if (existingThread) {
    return existingThread;
  }

  return ReviewModel.create({
    dishId,
    userId,
    status: REVIEW_STATUS.DRAFT
  });
}

async function ensurePrivateDishEditable(dishId: string, userId: string) {
  const review = await ReviewModel.findOne({ dishId, userId }).lean();
  const status = review?.status ?? REVIEW_STATUS.DRAFT;

  if (
    status !== REVIEW_STATUS.DRAFT &&
    status !== REVIEW_STATUS.REJECTED &&
    status !== REVIEW_STATUS.PENDING
  ) {
    throw createHttpError(
      403,
      'Chỉ có thể sửa món ăn riêng tư khi đang ở trạng thái nháp, đang chờ duyệt hoặc bị từ chối'
    );
  }

  return review;
}

async function ensurePrivateDishDeletable(dishId: string, userId: string) {
  const review = await ReviewModel.findOne({ dishId, userId }).lean();
  const status = review?.status ?? REVIEW_STATUS.DRAFT;

  if (
    status !== REVIEW_STATUS.DRAFT &&
    status !== REVIEW_STATUS.REJECTED &&
    status !== REVIEW_STATUS.PENDING
  ) {
    throw createHttpError(
      403,
      'Chỉ có thể xóa món ăn riêng tư khi đang ở trạng thái nháp, đang chờ duyệt hoặc bị từ chối'
    );
  }

  return review;
}

async function resetReviewStatusToDraft(dishId: string, userId: string) {
  const review = await ReviewModel.findOne({ dishId, userId });
  if (!review) {
    return;
  }

  // Only reset if status is PENDING or REJECTED
  if (
    review.status !== REVIEW_STATUS.PENDING &&
    review.status !== REVIEW_STATUS.REJECTED
  ) {
    return;
  }

  review.status = REVIEW_STATUS.DRAFT;
  review.nutritionistId = undefined as any;
  review.pickedAt = undefined as any;
  review.reviewedAt = undefined as any;
  review.rejectionReason = undefined as any;
  review.lastResubmittedAt = undefined as any;
  review.submittedAt = undefined as any;
  await review.save();
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
