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

describe('CollectionService.viewCollectionDetail', () => {
  let collectionId: string;
  let userId: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
    userId = new mongoose.Types.ObjectId().toString();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});

    // Create test dish
    const dish = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Phở bò',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });

    // Create test collection
    const collection = await CollectionModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giúp giảm cân hiệu quả',
      isPublic: true,
      image: 'collection-image.jpg',
      dishes: [
        {
          dishId: dish._id,
          name: dish.name,
          energy: 250,
          image: 'dish-image.jpg',
          addedAt: new Date()
        }
      ],
      followers: 10,
      tags: ['giảm cân', 'healthy']
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

  // Branch - Happy case: get collection detail successfully
  it('should get collection detail successfully', async () => {
    const collection =
      await CollectionService.viewCollectionDetail(collectionId);

    expect(collection).toBeDefined();
    expect(collection._id.toString()).toBe(collectionId);
    expect(collection.name).toBe('Món ăn giảm cân');
    expect(collection.description).toBe(
      'Bộ sưu tập các món ăn giúp giảm cân hiệu quả'
    );
    expect(collection.isPublic).toBe(true);
    expect(collection.image).toBe('collection-image.jpg');
    expect(collection.user?._id.toString()).toBe(userId);
    expect(collection.user?.name).toBe('Test User');
    expect(collection.dishes).toBeDefined();
    expect(Array.isArray(collection.dishes)).toBe(true);
    expect(collection.dishes.length).toBe(1);
    expect(collection.dishes[0].name).toBe('Phở bò');
    expect(collection.tags).toBeDefined();
    expect(Array.isArray(collection.tags)).toBe(true);
    expect(collection.tags).toContain('giảm cân');
    expect(collection.tags).toContain('healthy');
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    await expect(
      CollectionService.viewCollectionDetail('invalid-id')
    ).rejects.toThrow('Định dạng ID bộ sưu tập không hợp lệ');
  });

  // Branch - Collection not found
  it('should throw error when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      CollectionService.viewCollectionDetail(nonExistentId)
    ).rejects.toThrow('Không tìm thấy bộ sưu tập');
  });
});
