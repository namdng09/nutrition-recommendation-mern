import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument, PaginateResult, Types } from 'mongoose';

import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { ROLE } from '~/shared/constants/role';
import {
  CollectionModel,
  DishModel,
  ReviewModel,
  UserModel
} from '~/shared/database/models';
import type { Collection } from '~/shared/database/models/collection-model';
import type { Dish } from '~/shared/database/models/dish-model';
import {
  buildPaginateOptions,
  deleteImage,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import type {
  AddDishToCollectionRequest,
  CreateCollectionRequest,
  RemoveDishFromCollectionRequest,
  UpdateCollectionRequest
} from './collection-dto';

export const CollectionService = {
  createCollection: async (
    userId: string,
    userName: string,
    data: CreateCollectionRequest,
    image?: Express.Multer.File
  ) => {
    // Check private dishes before creating collection
    if (data.dishes && data.dishes.length > 0) {
      await validatePrivateDishesApproved(data.dishes, userId);
    }

    const dishesData =
      data.dishes && data.dishes.length > 0
        ? await resolveDishSnapshots(data.dishes)
        : [];

    const newCollection = await CollectionModel.create({
      ...data,
      user: {
        _id: userId,
        name: userName
      },
      dishes: dishesData
    });

    if (!newCollection) {
      throw createHttpError(500, 'Tạo bộ sưu tập thất bại');
    }

    if (image) await saveCollectionImage(newCollection, image);

    return newCollection;
  },

  viewCollections: async (
    parsed: QueryOptions,
    userId?: string
  ): Promise<PaginateResult<Collection>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    let favoriteCollectionIds: Set<string> = new Set();

    if (userId) {
      const user = await UserModel.findById(
        userId,
        'favoriteCollections'
      ).lean();

      if (user?.favoriteCollections?.length) {
        favoriteCollectionIds = new Set(
          user.favoriteCollections.map((id: unknown) => String(id))
        );
      }
    }

    const result = await CollectionModel.paginate(filter, options);

    result.docs = result.docs.map(doc => ({
      ...((doc as any).toObject?.() ?? doc),
      isFavorited: favoriteCollectionIds.has(String((doc as any)._id))
    })) as any;

    return result;
  },

  viewCollectionDetail: async (id: string, userId?: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    const dishIds = collection.dishes.map(d => d.dishId);
    const found = await DishModel.find(
      { _id: { $in: dishIds } },
      { _id: 1 }
    ).lean();
    const existingDishIds = new Set(found.map(d => d._id.toString()));

    const collObj = collection.toObject();
    const dishes = collObj.dishes.map(d => ({
      ...d,
      isDeleted: !d.dishId || !existingDishIds.has(d.dishId.toString())
    }));

    let isFavorited = false;
    if (userId) {
      const user = await UserModel.findById(
        userId,
        'favoriteCollections'
      ).lean();
      isFavorited =
        user?.favoriteCollections?.some(fId => String(fId) === id) ?? false;
    }

    return { ...collObj, dishes, isFavorited };
  },

  updateCollection: async (
    id: string,
    userId: string,
    data: UpdateCollectionRequest,
    image?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (collection.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật bộ sưu tập này');
    }

    const { dishes, ...rest } = data;
    const updatePayload: Record<string, unknown> = { ...rest };

    if (typeof dishes !== 'undefined') {
      updatePayload.dishes =
        dishes.length === 0 ? [] : await resolveDishSnapshots(dishes);
    }

    const updatedCollection = await CollectionModel.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    );

    if (!updatedCollection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (image) await replaceCollectionImage(updatedCollection, image);

    return updatedCollection;
  },

  deleteCollection: async (id: string, userId: string, userRole: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    const isOwner = collection.user?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    if (!isOwner && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền xóa bộ sưu tập này');
    }

    if (collection.image) await deleteImage(collection._id.toString());

    await collection.deleteOne();

    return collection;
  },

  deleteBulk: async (ids: string[], userId: string, userRole: string) => {
    ids.forEach(id => {
      if (!validateObjectId(id)) {
        throw createHttpError(
          400,
          `Định dạng ID bộ sưu tập không hợp lệ: ${id}`
        );
      }
    });

    const collections = await CollectionModel.find({ _id: { $in: ids } });

    const isAdmin = userRole === ROLE.ADMIN;

    if (!isAdmin) {
      const unauthorized = collections.find(
        c => c.user?._id.toString() !== userId
      );
      if (unauthorized) {
        throw createHttpError(
          403,
          'Bạn không có quyền xóa một số bộ sưu tập này'
        );
      }
    }

    await Promise.all(
      collections.map(c =>
        c.image ? deleteImage(c._id.toString()) : Promise.resolve()
      )
    );

    const result = await CollectionModel.deleteMany({ _id: { $in: ids } });

    return result;
  },

  addDishToCollection: async (
    id: string,
    userId: string,
    data: AddDishToCollectionRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (collection.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền sửa bộ sưu tập này');
    }

    const existingDishIds = collection.dishes.map(dish =>
      dish.dishId?.toString()
    );
    const duplicates = data.dishIds.filter(dishId =>
      existingDishIds.includes(dishId)
    );

    if (duplicates.length > 0) {
      throw createHttpError(
        400,
        `Các món ăn sau đã tồn tại trong bộ sưu tập: ${duplicates.join(', ')}`
      );
    }

    // Check private dishes before adding
    await validatePrivateDishesApproved(data.dishIds, userId);

    const newDishes = await resolveDishSnapshots(data.dishIds);

    collection.dishes.push(...newDishes);
    await collection.save();

    return collection;
  },

  removeDishFromCollection: async (
    id: string,
    userId: string,
    data: RemoveDishFromCollectionRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (collection.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền sửa bộ sưu tập này');
    }

    const initialDishCount = collection.dishes.length;

    collection.set(
      'dishes',
      collection.dishes.filter(
        dish => !data.dishIds.includes(dish.dishId?.toString() ?? '')
      )
    );

    if (collection.dishes.length === initialDishCount) {
      throw createHttpError(404, 'Không tìm thấy món ăn nào trong bộ sưu tập');
    }

    await collection.save();

    return collection;
  }
};

function getDishEnergy(dish: HydratedDocument<Dish>): number {
  const energyValue = dish?.nutrition?.nutrients?.[0]?.value;
  return typeof energyValue === 'number' && Number.isFinite(energyValue)
    ? energyValue
    : 0;
}

async function resolveDishSnapshots(dishIds: string[]) {
  for (const dishId of dishIds) {
    if (!validateObjectId(dishId)) {
      throw createHttpError(400, `Định dạng ID món ăn không hợp lệ: ${dishId}`);
    }
  }

  const dishes = await DishModel.find({ _id: { $in: dishIds } });

  if (dishes.length !== dishIds.length) {
    throw createHttpError(404, 'Một hoặc nhiều món ăn không tồn tại');
  }

  return dishes.map(dish => ({
    dishId: dish._id as Types.ObjectId,
    name: dish.name,
    energy: getDishEnergy(dish),
    image: dish.image
  }));
}

async function validatePrivateDishesApproved(
  dishIds: string[],
  userId: string
) {
  if (dishIds.length === 0) return;

  const dishes = await DishModel.find({ _id: { $in: dishIds } })
    .select('isPublic user')
    .lean();

  // Check private dishes owned by user
  const privateDishes = dishes.filter(
    dish => !dish.isPublic && dish.user?._id.toString() === userId
  );

  if (privateDishes.length > 0) {
    const privateDishIds = privateDishes.map(dish => dish._id.toString());
    const reviews = await ReviewModel.find({
      dishId: { $in: privateDishIds },
      userId,
      status: REVIEW_STATUS.APPROVED
    }).lean();

    const approvedDishIds = new Set(
      reviews.map(review => review.dishId.toString())
    );

    const unapprovedDishes = privateDishes.filter(
      dish => !approvedDishIds.has(dish._id.toString())
    );

    if (unapprovedDishes.length > 0) {
      throw createHttpError(
        400,
        'Món ăn riêng tư chưa được duyệt, không thể thêm vào bộ sưu tập'
      );
    }
  }

  // Check private dishes not owned by user
  const otherPrivateDishes = dishes.filter(
    dish => !dish.isPublic && dish.user?._id.toString() !== userId
  );

  if (otherPrivateDishes.length > 0) {
    throw createHttpError(
      403,
      'Bạn không có quyền sử dụng món ăn riêng tư của người khác'
    );
  }
}

async function saveCollectionImage(
  collection: HydratedDocument<Collection>,
  file: Express.Multer.File
) {
  const uploadResult = await uploadImage(
    file.buffer,
    collection._id.toString()
  );

  if (uploadResult.success && uploadResult.data) {
    collection.image = uploadResult.data.secure_url;
    await collection.save();
  } else {
    throw createHttpError(500, 'Tải ảnh lên thất bại');
  }
}

async function replaceCollectionImage(
  collection: HydratedDocument<Collection>,
  file: Express.Multer.File
) {
  await deleteImage(collection._id.toString());
  await saveCollectionImage(collection, file);
}
