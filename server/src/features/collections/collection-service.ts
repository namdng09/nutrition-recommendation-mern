import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { CollectionModel, DishModel } from '~/shared/database/models';
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

/**
 * Calculate total calories for a dish based on its ingredients
 * @param dish Object representing the dish
 * @returns Total calories for the dish
 */
const calculateDishCalories = (dish: any): number => {
  if (!dish.ingredients || dish.ingredients.length === 0) {
    return 0;
  }
  
  let totalCalories = 0;
  for (const ingredient of dish.ingredients) {
    const ingredientCalories = ingredient.nutrients?.calories?.value || 0;
    totalCalories += ingredientCalories;
  }
  
  return totalCalories;
};

export const CollectionService = {
  createCollection: async (
    userId: string,
    userName: string,
    data: CreateCollectionRequest,
    image?: Express.Multer.File
  ) => {
    let dishesData: any[] = [];
    if (data.dishes && data.dishes.length > 0) {
      for (const dishId of data.dishes) {
        if (!validateObjectId(dishId)) {
          throw createHttpError(400, `Định dạng ID món ăn không hợp lệ: ${dishId}`);
        }
      }

      const dishes = await DishModel.find({ _id: { $in: data.dishes } });

      if (dishes.length !== data.dishes.length) {
        throw createHttpError(404, 'Một hoặc nhiều món ăn không tồn tại');
      }

      dishesData = dishes.map(dish => ({
        dishId: dish._id,
        name: dish.name,
        calories: calculateDishCalories(dish),
        image: dish.image,
        addedAt: new Date()
      }));
    }

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

    for (const dishId of data.dishIds) {
      if (!validateObjectId(dishId)) {
        throw createHttpError(400, `Định dạng ID món ăn không hợp lệ: ${dishId}`);
      }
    }

    const collection = await CollectionModel.findById(id);

    if (!collection) {
      throw createHttpError(404, 'Không tìm thấy bộ sưu tập');
    }

    if (collection.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền sửa bộ sưu tập này');
    }

    const existingDishIds = collection.dishes.map(dish => dish.dishId?.toString());
    const duplicates = data.dishIds.filter(dishId => existingDishIds.includes(dishId));
    
    if (duplicates.length > 0) {
      throw createHttpError(400, `Các món ăn sau đã tồn tại trong bộ sưu tập: ${duplicates.join(', ')}`);
    }

    const dishes = await DishModel.find({ _id: { $in: data.dishIds } });

    if (dishes.length !== data.dishIds.length) {
      throw createHttpError(404, 'Một hoặc nhiều món ăn không tồn tại');
    }

    const newDishes = dishes.map(dish => ({
      dishId: dish._id as any,
      name: dish.name,
      calories: calculateDishCalories(dish),
      image: dish.image,
      addedAt: new Date()
    }));

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
    
    for (let i = collection.dishes.length - 1; i >= 0; i--) {
      const currentDishId = collection.dishes[i].dishId?.toString() || '';
      
      if (data.dishIds.includes(currentDishId)) {
        collection.dishes.splice(i, 1);
      }
    }

    if (collection.dishes.length === initialDishCount) {
      throw createHttpError(404, 'Không tìm thấy món ăn nào trong bộ sưu tập');
    }

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
