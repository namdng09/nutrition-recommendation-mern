import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { UNIT } from '~/shared/constants/unit';
import { IngredientModel } from '~/shared/database/models';

describe('GET /api/ingredients/:id', () => {
  let ingredientId: string;

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
    await IngredientModel.deleteMany({});

    // Create a test ingredient for happy case
    const ingredient = await IngredientModel.create({
      name: 'Cà chua',
      description: 'Cà chua tươi',
      categories: [INGREDIENT_CATEGORY.VEGETABLES],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      units: [
        { value: 1, unit: 'quả', isDefault: true },
        { value: 200, unit: UNIT.GRAM, isDefault: false }
      ],
      allergens: [],
      nutrition: {
        nutrients: {
          calories: { value: 18, unit: UNIT.KILOCALORIE },
          carbs: { value: 3.9, unit: UNIT.GRAM },
          fat: { value: 0.2, unit: UNIT.GRAM },
          protein: { value: 0.9, unit: UNIT.GRAM },
          fiber: { value: 1.2, unit: UNIT.GRAM },
          sodium: { value: 5, unit: UNIT.MILLIGRAM },
          cholesterol: { value: 0, unit: UNIT.MILLIGRAM }
        }
      },
      isActive: true
    });
    ingredientId = ingredient._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await IngredientModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should get ingredient detail successfully', async () => {
    const res = await request(app).get(`/api/ingredients/${ingredientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'Lấy thông tin nguyên liệu thành công'
    );
    expect(res.body.data).toHaveProperty('_id', ingredientId);
    expect(res.body.data).toHaveProperty('name', 'Cà chua');
    expect(res.body.data).toHaveProperty('description', 'Cà chua tươi');
    expect(res.body.data).toHaveProperty('categories');
    expect(res.body.data.categories).toContain(INGREDIENT_CATEGORY.VEGETABLES);
    expect(res.body.data).toHaveProperty('baseUnit');
    expect(res.body.data.baseUnit).toHaveProperty('amount', 100);
    expect(res.body.data.baseUnit).toHaveProperty('unit', UNIT.GRAM);
    expect(res.body.data).toHaveProperty('units');
    expect(Array.isArray(res.body.data.units)).toBe(true);
    expect(res.body.data).toHaveProperty('nutrition');
    expect(res.body.data).toHaveProperty('isActive', true);
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app).get('/api/ingredients/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Định dạng ID nguyên liệu không hợp lệ'
    );
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when ingredient does not exist', async () => {
    // Create a valid ObjectId that doesn't exist in database
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/ingredients/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy nguyên liệu');
  });
});
