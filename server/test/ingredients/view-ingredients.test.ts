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

  // ============ QUERY FEATURES ============
  it('should get ingredients with pagination', async () => {
    const res = await request(app).get('/api/ingredients?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBe(2);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.docs.length).toBe(2);
    expect(res.body.data.totalDocs).toBe(4);
    expect(res.body.data.totalPages).toBe(2);
  });

  it('should get only active ingredients', async () => {
    const res = await request(app).get('/api/ingredients?isActive=true');

    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBe(3);
    expect(
      res.body.data.docs.every((item: any) => item.isActive === true)
    ).toBe(true);
  });

  it('should get ingredients by category', async () => {
    const res = await request(app).get(
      `/api/ingredients?categories=${INGREDIENT_CATEGORY.VEGETABLES}`
    );

    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBe(1);
    expect(res.body.data.docs[0].name).toBe('Cà chua');
  });

  it('should search ingredients by name', async () => {
    const res = await request(app).get('/api/ingredients?name=/cá/i');

    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBe(1);
  });

  it('should sort ingredients by name ascending', async () => {
    const res = await request(app).get('/api/ingredients?sort=name');

    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBe(4);
    expect(res.body.data.docs[0].name).toBe('Cà chua');
  });

  it('should sort ingredients by name descending', async () => {
    const res = await request(app).get('/api/ingredients?sort=-name');

    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBe(4);
    expect(res.body.data.docs[0].name).toBe('Thịt bò');
  });

  it('should return only selected fields', async () => {
    const res = await request(app).get(
      `/api/ingredients?select=name,categories`
    );

    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBeGreaterThan(0);
    expect(res.body.data.docs[0]).toHaveProperty('name');
    expect(res.body.data.docs[0]).toHaveProperty('categories');
    expect(res.body.data.docs[0]).toHaveProperty('_id');
  });

  // ============ EDGE CASES ============
  it('should return empty array when no ingredients match filter', async () => {
    const res = await request(app).get('/api/ingredients?name=nonexistent');

    expect(res.status).toBe(200);
    expect(res.body.data.docs).toEqual([]);
    expect(res.body.data.totalDocs).toBe(0);
  });

  it('should return empty array when page exceeds total pages', async () => {
    const res = await request(app).get('/api/ingredients?page=999&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBe(0);
    expect(res.body.data.page).toBe(999);
  });
});
