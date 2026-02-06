import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { ALLERGEN } from '~/shared/constants/allergen';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { UNIT } from '~/shared/constants/unit';
import { DishModel } from '~/shared/database/models';

describe('GET /api/dishes/:id', () => {
  let dishId: string;
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
    await DishModel.deleteMany({});

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

  // ============ HAPPY CASES ============
  it('should get dish detail successfully', async () => {
    const res = await request(app).get(`/api/dishes/${dishId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'Lấy thông tin món ăn thành công'
    );
    expect(res.body.data).toHaveProperty('_id', dishId);
    expect(res.body.data).toHaveProperty('name', 'Phở bò');
    expect(res.body.data).toHaveProperty('description');
    expect(res.body.data).toHaveProperty('categories');
    expect(res.body.data.categories).toContain(DISH_CATEGORY.MAIN_COURSE);
    expect(res.body.data.categories).toContain(DISH_CATEGORY.SOUP);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('_id', userId);
    expect(res.body.data.user).toHaveProperty('name', 'Test User');
    expect(res.body.data).toHaveProperty('ingredients');
    expect(Array.isArray(res.body.data.ingredients)).toBe(true);
    expect(res.body.data.ingredients.length).toBe(2);
    expect(res.body.data.ingredients[0]).toHaveProperty('name', 'Thịt bò');
    expect(res.body.data.ingredients[0]).toHaveProperty('nutrients');
    expect(res.body.data.ingredients[1]).toHaveProperty('allergens');
    expect(res.body.data.ingredients[1].allergens).toContain(ALLERGEN.GLUTEN);
    expect(res.body.data).toHaveProperty('instructions');
    expect(Array.isArray(res.body.data.instructions)).toBe(true);
    expect(res.body.data.instructions.length).toBe(4);
    expect(res.body.data.instructions[0]).toHaveProperty('step', 1);
    expect(res.body.data).toHaveProperty('image', 'pho-bo.jpg');
    expect(res.body.data).toHaveProperty('isActive', true);
    expect(res.body.data).toHaveProperty('isPublic', true);
    expect(res.body.data).toHaveProperty('preparationTime', 30);
    expect(res.body.data).toHaveProperty('cookTime', 240);
    expect(res.body.data).toHaveProperty('servings', 4);
    expect(res.body.data).toHaveProperty('tags');
    expect(Array.isArray(res.body.data.tags)).toBe(true);
    expect(res.body.data.tags).toContain('phở');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app).get('/api/dishes/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Định dạng ID món ăn không hợp lệ'
    );
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when dish does not exist', async () => {
    // Create a valid ObjectId that doesn't exist in database
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/dishes/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy món ăn');
  });
});
