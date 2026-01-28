import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { CollectionModel } from '~/shared/database/models';
import type { Collection } from '~/shared/database/models/collection-model';
import {
  buildPaginateOptions,
  deleteImage,
  type PaginateResponse,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import {
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
    const newCollection = await CollectionModel.create({
      ...data,
      user: {
        _id: userId,
        name: userName
      },
      dishes: data.dishes || []
    });

    if (!newCollection) {
      throw createHttpError(500, 'Tạo bộ sưu tập thất bại');
    }

    if (image) {
      const uploadResult = await uploadImage(
        image.buffer,
        newCollection._id.toString()
      );
      if (uploadResult.success && uploadResult.data) {
        newCollection.image = uploadResult.data.secure_url;
        await newCollection.save();
      } else {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }
    }

    return newCollection;
  },

  viewCollections: async (
    parsed: QueryOptions
  ): Promise<PaginateResponse<Collection>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await CollectionModel.paginate(filter, options);

    return result as unknown as PaginateResponse<Collection>;
  },

  viewCollectionDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    return collection;
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

    const updatedCollection = await CollectionModel.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!updatedCollection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (image) {
      await deleteImage(updatedCollection._id.toString());

      const uploadResult = await uploadImage(
        image.buffer,
        updatedCollection._id.toString()
      );
      if (uploadResult.success && uploadResult.data) {
        updatedCollection.image = uploadResult.data.secure_url;
        await updatedCollection.save();
      } else {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }
    }

    return updatedCollection;
  },

  deleteCollection: async (id: string, userId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (collection.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xóa bộ sưu tập này');
    }

    if (collection.image) {
      await deleteImage(collection._id.toString());
    }

    await CollectionModel.findByIdAndDelete(id);
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

    const dishExists = collection.dishes.some(
      (dish) => dish.dishId?.toString() === data.dishId
    );

    if (dishExists) {
      throw createHttpError(400, 'Món ăn đã tồn tại trong bộ sưu tập');
    }

    collection.dishes.push({
      dishId: data.dishId as any,
      name: data.name,
      calories: data.calories,
      image: data.image,
      addedAt: new Date()
    });

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

    const dishIndex = collection.dishes.findIndex(
      (dish) => dish.dishId?.toString() === data.dishId
    );

    if (dishIndex === -1) {
      throw createHttpError(404, 'Không tìm thấy món ăn trong bộ sưu tập');
    }

    collection.dishes.splice(dishIndex, 1);

    await collection.save();

    return collection;
  },

  followCollection: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (!collection.isPublic) {
      throw createHttpError(403, 'Không thể theo dõi bộ sưu tập riêng tư');
    }

    collection.followers = (collection.followers || 0) + 1;
    await collection.save();

    return collection;
  },

  unfollowCollection: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (collection.followers && collection.followers > 0) {
      collection.followers -= 1;
      await collection.save();
    }

    return collection;
  }
};
