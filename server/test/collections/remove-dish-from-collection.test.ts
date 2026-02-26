import mongoose from 'mongoose';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { CollectionService } from '~/features/collections/collection-service';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { CollectionModel, DishModel } from '~/shared/database/models';

describe('CollectionService.removeDishFromCollection', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const otherUserId = new mongoose.Types.ObjectId().toString();
  let collectionId: string;
  let dishId1: string;
  let dishId2: string;
  let dishId3: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    // Clean up database before each test
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});

    // Create test dishes
    const dish1 = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Phở bò',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });
    dishId1 = dish1._id.toString();

    const dish2 = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Bún chả',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Ướp thịt' }],
      isActive: true
    });
    dishId2 = dish2._id.toString();

    const dish3 = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Cơm tấm',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Nướng thịt' }],
      isActive: true
    });
    dishId3 = dish3._id.toString();

    // Create test collection with dishes
    const collection = await CollectionModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Món ăn Việt',
      description: 'Bộ sưu tập các món ăn Việt Nam',
      isPublic: false,
      dishes: [
        {
          dishId: dish1._id,
          name: dish1.name,
          energy: 250,
          image: 'pho-bo.jpg',
          addedAt: new Date()
        },
        {
          dishId: dish2._id,
          name: dish2.name,
          energy: 300,
          image: 'bun-cha.jpg',
          addedAt: new Date()
        },
        {
          dishId: dish3._id,
          name: dish3.name,
          energy: 400,
          image: 'com-tam.jpg',
          addedAt: new Date()
        }
      ]
    });
    collectionId = collection._id.toString();
  });

  afterEach(async () => {
    // Clean up after each test
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case: remove dishes from collection
  it('should remove dishes from collection successfully', async () => {
    const updatedCollection = await CollectionService.removeDishFromCollection(
      collectionId,
      userId,
      { dishIds: [dishId1, dishId2] }
    );

    expect(updatedCollection).toBeDefined();
    expect(updatedCollection.dishes).toHaveLength(1);
    expect(
      updatedCollection.dishes.find(d => d.dishId?.toString() === dishId1)
    ).toBeUndefined();
    expect(
      updatedCollection.dishes.find(d => d.dishId?.toString() === dishId2)
    ).toBeUndefined();
    expect(
      updatedCollection.dishes.find(d => d.dishId?.toString() === dishId3)
    ).toBeDefined();
  });

  // Branch - Unauthorized user
  it('should throw error when removing from collection of another user', async () => {
    await expect(
      CollectionService.removeDishFromCollection(collectionId, otherUserId, {
        dishIds: [dishId1]
      })
    ).rejects.toThrow('Bạn không có quyền sửa bộ sưu tập này');
  });

  // Branch - Invalid collection ID format
  it('should throw error when collection id format is invalid', async () => {
    await expect(
      CollectionService.removeDishFromCollection('invalid-id', userId, {
        dishIds: [dishId1]
      })
    ).rejects.toThrow('Định dạng ID bộ sưu tập không hợp lệ');
  });

  // Branch - Collection not found
  it('should throw error when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      CollectionService.removeDishFromCollection(nonExistentId, userId, {
        dishIds: [dishId1]
      })
    ).rejects.toThrow('Không tìm thấy bộ sưu tập');
  });

  // Branch - Dish not in collection
  it('should throw error when dish is not in collection', async () => {
    const nonExistentDishId = new mongoose.Types.ObjectId().toString();

    await expect(
      CollectionService.removeDishFromCollection(collectionId, userId, {
        dishIds: [nonExistentDishId]
      })
    ).rejects.toThrow('Không tìm thấy món ăn nào trong bộ sưu tập');
  });
});
