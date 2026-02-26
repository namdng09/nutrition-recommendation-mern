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
import { ALLERGEN } from '~/shared/constants/allergen';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { UNIT } from '~/shared/constants/unit';
import { DishModel } from '~/shared/database/models';

describe('DishService.viewDishDetail', () => {
  let dishId: string;
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

    // Create a test dish for happy case
    const dish = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Phở bò',
      description: 'Phở bò truyền thống Hà Nội với nước dùng trong, thơm',
      categories: [DISH_CATEGORY.MAIN_COURSE, DISH_CATEGORY.SOUP],
      ingredients: [
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: 'Thịt bò',
          description: 'Thịt bò Úc',
          image: 'beef.jpg',
          nutrients: {
            calories: { value: 250, unit: UNIT.KILOCALORIE },
            carbs: { value: 0, unit: UNIT.GRAM },
            fat: { value: 15, unit: UNIT.GRAM },
            protein: { value: 26, unit: UNIT.GRAM },
            fiber: { value: 0, unit: UNIT.GRAM },
            sodium: { value: 72, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 90, unit: UNIT.MILLIGRAM }
          },
          allergens: [],
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [
            { value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true },
            { value: 100, quantity: 1, unit: 'lát', isDefault: false }
          ]
        },
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: 'Bánh phở',
          description: 'Bánh phở tươi',
          image: 'pho-noodles.jpg',
          nutrients: {
            calories: { value: 109, unit: UNIT.KILOCALORIE },
            carbs: { value: 24, unit: UNIT.GRAM },
            fat: { value: 0.2, unit: UNIT.GRAM },
            protein: { value: 1.8, unit: UNIT.GRAM },
            fiber: { value: 1, unit: UNIT.GRAM },
            sodium: { value: 3, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 0, unit: UNIT.MILLIGRAM }
          },
          allergens: [ALLERGEN.GLUTEN],
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 300, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [
        { step: 1, description: 'Luộc xương bò với hành, gừng đập dập' },
        { step: 2, description: 'Nấu nước dùng với gia vị trong 3-4 tiếng' },
        { step: 3, description: 'Trụng bánh phở và bày ra tô' },
        { step: 4, description: 'Chan nước dùng nóng và thêm rau thơm' }
      ],
      image: 'pho-bo.jpg',
      isActive: true,
      isPublic: true,
      preparationTime: 30,
      cookTime: 240,
      servings: 4,
      tags: ['phở', 'bò', 'việt nam', 'truyền thống']
    });
    dishId = dish._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await DishModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should get dish detail successfully', async () => {
    const dish = await DishService.viewDishDetail(dishId);

    expect(dish).toBeDefined();
    expect(dish._id.toString()).toBe(dishId);
    expect(dish.name).toBe('Phở bò');
    expect(dish.ingredients).toHaveLength(2);
    expect(dish.instructions).toHaveLength(4);
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    await expect(DishService.viewDishDetail('invalid-id')).rejects.toThrow(
      'Định dạng ID món ăn không hợp lệ'
    );
  });

  // Branch - Dish not found
  it('should throw error when dish does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    await expect(DishService.viewDishDetail(nonExistentId)).rejects.toThrow(
      'Không tìm thấy món ăn'
    );
  });
});
