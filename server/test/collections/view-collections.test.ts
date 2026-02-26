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

describe('CollectionService.viewCollections', () => {
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
    userId1 = new mongoose.Types.ObjectId().toString();
    userId2 = new mongoose.Types.ObjectId().toString();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});

    // Create test dishes
    const dish1 = await DishModel.create({
      user: { _id: userId1, name: 'User 1' },
      name: 'Phở bò',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });

    const dish2 = await DishModel.create({
      user: { _id: userId1, name: 'User 1' },
      name: 'Bún chả',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Ướp thịt' }],
      isActive: true
    });

    // Create test collections
    await CollectionModel.create({
      user: { _id: userId1, name: 'User 1' },
      name: 'Món ăn giảm cân',
      description: 'Các món ăn giúp giảm cân',
      isPublic: true,
      dishes: [
        {
          dishId: dish1._id,
          name: dish1.name,
          energy: 250,
          addedAt: new Date()
        }
      ],
      followers: 10,
      tags: ['giảm cân', 'healthy']
    });

    await CollectionModel.create({
      user: { _id: userId1, name: 'User 1' },
      name: 'Món ăn tăng cơ',
      description: 'Các món ăn cho người tập gym',
      isPublic: false,
      dishes: [
        {
          dishId: dish2._id,
          name: dish2.name,
          energy: 300,
          addedAt: new Date()
        }
      ],
      followers: 5,
      tags: ['tăng cơ', 'gym']
    });

    await CollectionModel.create({
      user: { _id: userId2, name: 'User 2' },
      name: 'Món ăn Việt',
      description: 'Các món ăn truyền thống Việt Nam',
      isPublic: true,
      dishes: [],
      followers: 20,
      tags: ['việt nam', 'truyền thống']
    });
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

  // Branch - Happy case: get all collections
  it('should get all collections successfully', async () => {
    const result = await CollectionService.viewCollections({
      filter: {},
      sort: {},
      limit: 10,
      skip: 0,
      populate: []
    });

    expect(result).toBeDefined();
    expect(result.docs).toBeDefined();
    expect(Array.isArray(result.docs)).toBe(true);
    expect(result.docs.length).toBe(3);
    expect(result.page).toBeDefined();
    expect(result.totalPages).toBeDefined();
  });
});
