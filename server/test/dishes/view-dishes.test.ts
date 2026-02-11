import mongoose from 'mongoose';
import { vi } from 'vitest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { DishService } from '~/features/dishes/dish-service';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { DishModel } from '~/shared/database/models';

vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: { secure_url: 'https://mock-cloudinary.com/image.jpg' }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

describe('DishService.viewDishes', () => {
  let userId: string;

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
    await DishModel.deleteMany({});
    userId = new mongoose.Types.ObjectId().toString();

    // Create test dishes
    await DishModel.create([
      {
        user: { _id: userId, name: 'Test User' },
        name: 'Phở bò',
        description: 'Phở bò truyền thống Hà Nội',
        categories: [DISH_CATEGORY.MAIN_COURSE, DISH_CATEGORY.SOUP],
        ingredients: [],
        instructions: [
          { step: 1, description: 'Luộc xương bò' },
          { step: 2, description: 'Nấu nước dùng' }
        ],
        image: 'pho-bo.jpg',
        isActive: true,
        isPublic: true,
        preparationTime: 30,
        cookTime: 120,
        servings: 2,
        tags: ['phở', 'bò', 'việt nam']
      },
      {
        user: { _id: userId, name: 'Test User' },
        name: 'Bún chả',
        description: 'Bún chả Hà Nội',
        categories: [DISH_CATEGORY.MAIN_COURSE],
        ingredients: [],
        instructions: [{ step: 1, description: 'Ướp thịt' }],
        image: 'bun-cha.jpg',
        isActive: true,
        isPublic: true,
        preparationTime: 20,
        cookTime: 30,
        servings: 2,
        tags: ['bún', 'chả', 'việt nam']
      },
      {
        user: { _id: userId, name: 'Test User' },
        name: 'Salad rau củ',
        description: 'Salad rau củ tươi',
        categories: [DISH_CATEGORY.SALAD, DISH_CATEGORY.SIDE_DISH],
        ingredients: [],
        instructions: [{ step: 1, description: 'Rửa rau' }],
        image: 'salad.jpg',
        isActive: true,
        isPublic: true,
        preparationTime: 10,
        cookTime: 0,
        servings: 2,
        tags: ['salad', 'rau']
      },
      {
        user: { _id: userId, name: 'Test User' },
        name: 'Bánh flan',
        description: 'Bánh flan caramel',
        categories: [DISH_CATEGORY.DESSERT],
        ingredients: [],
        instructions: [{ step: 1, description: 'Làm caramel' }],
        image: 'flan.jpg',
        isActive: false,
        isPublic: false,
        preparationTime: 15,
        cookTime: 45,
        servings: 4,
        tags: ['bánh', 'ngọt']
      }
    ]);
  });

  afterAll(async () => {
    // Clean up and close connection
    await DishModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should get all dishes successfully', async () => {
    const result = await DishService.viewDishes({
      filter: {},
      limit: 10
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('docs');
    expect(result).toHaveProperty('totalDocs');
    expect(result).toHaveProperty('page');
    expect(Array.isArray(result.docs)).toBe(true);
    expect(result.docs.length).toBe(4);
  });
});
