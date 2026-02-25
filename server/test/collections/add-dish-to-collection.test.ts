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
import { UNIT } from '~/shared/constants/unit';
import { CollectionModel, DishModel } from '~/shared/database/models';

describe('CollectionService.addDishToCollection', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const otherUserId = new mongoose.Types.ObjectId().toString();
  let collectionId: string;
  let dishId1: string;
  let dishId2: string;

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
      description: 'Phở bò truyền thống',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: 'Thịt bò',
          nutrients: {
            calories: { value: 250, unit: UNIT.KILOCALORIE },
            carbs: { value: 0, unit: UNIT.GRAM },
            fat: { value: 15, unit: UNIT.GRAM },
            protein: { value: 26, unit: UNIT.GRAM },
            fiber: { value: 0, unit: UNIT.GRAM },
            sodium: { value: 72, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 90, unit: UNIT.MILLIGRAM }
          },
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true,
      image: 'pho-bo.jpg'
    });
    dishId1 = dish1._id.toString();

    const dish2 = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Bún chả',
      description: 'Bún chả Hà Nội',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: 'Thịt lợn',
          nutrients: {
            calories: { value: 300, unit: UNIT.KILOCALORIE },
            carbs: { value: 0, unit: UNIT.GRAM },
            fat: { value: 20, unit: UNIT.GRAM },
            protein: { value: 24, unit: UNIT.GRAM },
            fiber: { value: 0, unit: UNIT.GRAM },
            sodium: { value: 60, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 80, unit: UNIT.MILLIGRAM }
          },
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 150, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Ướp thịt' }],
      isActive: true,
      image: 'bun-cha.jpg'
    });
    dishId2 = dish2._id.toString();

    // Create test collection
    const collection = await CollectionModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giảm cân',
      isPublic: false,
      dishes: []
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

  // Branch - Happy case: add dishes to collection successfully
  it('should add dishes to collection successfully', async () => {
    const updatedCollection = await CollectionService.addDishToCollection(
      collectionId,
      userId,
      { dishIds: [dishId1, dishId2] }
    );

    expect(updatedCollection).toBeDefined();
    expect(updatedCollection.dishes).toHaveLength(2);
    expect(updatedCollection.dishes[0].dishId?.toString()).toBe(dishId1);
    expect(updatedCollection.dishes[1].dishId?.toString()).toBe(dishId2);
  });

  // Branch - Unauthorized user
  it('should throw error when adding to collection of another user', async () => {
    await expect(
      CollectionService.addDishToCollection(collectionId, otherUserId, {
        dishIds: [dishId1]
      })
    ).rejects.toThrow('Bạn không có quyền sửa bộ sưu tập này');
  });

  // Branch - Invalid collection ID format
  it('should throw error when collection id format is invalid', async () => {
    await expect(
      CollectionService.addDishToCollection('invalid-id', userId, {
        dishIds: [dishId1]
      })
    ).rejects.toThrow('Định dạng ID bộ sưu tập không hợp lệ');
  });

  // Branch - Invalid dish ID format
  it('should throw error when dish id format is invalid', async () => {
    await expect(
      CollectionService.addDishToCollection(collectionId, userId, {
        dishIds: ['invalid-id']
      })
    ).rejects.toThrow('Định dạng ID món ăn không hợp lệ');
  });

  // Branch - Duplicate dish
  it('should throw error when trying to add duplicate dish', async () => {
    // Add dish to collection
    await CollectionService.addDishToCollection(collectionId, userId, {
      dishIds: [dishId1]
    });

    // Add same dish again
    await expect(
      CollectionService.addDishToCollection(collectionId, userId, {
        dishIds: [dishId1]
      })
    ).rejects.toThrow(`Các món ăn sau đã tồn tại trong bộ sưu tập: ${dishId1}`);
  });

  // Branch - Collection not found
  it('should throw error when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      CollectionService.addDishToCollection(nonExistentId, userId, {
        dishIds: [dishId1]
      })
    ).rejects.toThrow('Không tìm thấy bộ sưu tập');
  });

  // Branch - Dish not found
  it('should throw error when dish does not exist', async () => {
    const nonExistentDishId = new mongoose.Types.ObjectId().toString();

    await expect(
      CollectionService.addDishToCollection(collectionId, userId, {
        dishIds: [nonExistentDishId]
      })
    ).rejects.toThrow('Một hoặc nhiều món ăn không tồn tại');
  });
});
