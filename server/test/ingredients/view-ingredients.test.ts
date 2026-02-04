import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { UNIT } from '~/shared/constants/unit';
import { IngredientModel } from '~/shared/database/models';

describe('GET /api/ingredients', () => {
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

    // Create test ingredients
    await IngredientModel.create([
      {
        name: 'Cà chua',
        description: 'Cà chua tươi',
        categories: [INGREDIENT_CATEGORY.VEGETABLES],
        baseUnit: { amount: 100, unit: UNIT.GRAM },
        allergens: [],
        isActive: true
      },
      {
        name: 'Thịt bò',
        description: 'Thịt bò Úc',
        categories: [INGREDIENT_CATEGORY.MEAT],
        baseUnit: { amount: 100, unit: UNIT.GRAM },
        allergens: [],
        isActive: true
      },
      {
        name: 'Cá hồi',
        description: 'Cá hồi Na Uy',
        categories: [INGREDIENT_CATEGORY.SEAFOOD],
        baseUnit: { amount: 100, unit: UNIT.GRAM },
        allergens: [],
        isActive: true
      },
      {
        name: 'Sữa tươi',
        description: 'Sữa tươi Vinamilk',
        categories: [INGREDIENT_CATEGORY.DAIRY],
        baseUnit: { amount: 100, unit: UNIT.MILLILITER },
        allergens: [],
        isActive: false
      }
    ]);
  });

  afterAll(async () => {
    // Clean up and close connection
    await IngredientModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should get all ingredients successfully', async () => {
    const res = await request(app).get('/api/ingredients');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'Lấy danh sách nguyên liệu thành công'
    );
    expect(res.body.data).toHaveProperty('docs');
    expect(res.body.data).toHaveProperty('totalDocs');
    expect(res.body.data).toHaveProperty('page');
    expect(Array.isArray(res.body.data.docs)).toBe(true);
    expect(res.body.data.docs.length).toBe(4);
  });
});
