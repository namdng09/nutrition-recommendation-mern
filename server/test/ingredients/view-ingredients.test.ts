import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { IngredientModel } from '~/shared/database/models';

import { seedIngredients } from '../seed-data';

describe('GET /api/ingredients', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    await IngredientModel.deleteMany({});
  });

  afterAll(async () => {
    await IngredientModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ==================== HAPPY PATH ====================
  describe('Happy Path', () => {
    it('TC1.1: should return 200 with empty array when no ingredients exist', async () => {
      const res = await request(app).get('/api/ingredients');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data.docs).toEqual([]);
      expect(res.body.data.totalDocs).toBe(0);
    });

    it('TC1.2: should return ingredients successfully with correct structure', async () => {
      await seedIngredients();

      const res = await request(app).get('/api/ingredients');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', 'Ingredients retrieved successfully');
      expect(res.body.data).toHaveProperty('docs');
      expect(Array.isArray(res.body.data.docs)).toBe(true);
      expect(res.body.data.docs.length).toBeGreaterThan(0);
      
      // Verify response structure
      expect(res.body.data).toHaveProperty('totalDocs');
      expect(res.body.data).toHaveProperty('totalPages');
      expect(res.body.data).toHaveProperty('page');
      expect(res.body.data).toHaveProperty('hasPrevPage');
      expect(res.body.data).toHaveProperty('hasNextPage');
      
      // Verify ingredient fields
      const ingredient = res.body.data.docs[0];
      expect(ingredient).toHaveProperty('name');
      expect(ingredient).toHaveProperty('category');
      expect(ingredient).toHaveProperty('unit');
      expect(ingredient).toHaveProperty('caloriesPer100g');
      expect(ingredient).toHaveProperty('protein');
      expect(ingredient).toHaveProperty('isActive');
    });
  });

  // ==================== FILTERING & PAGINATION ====================
  describe('Filtering & Pagination', () => {
    it('TC2.1: should work with pagination parameters', async () => {
      await seedIngredients();

      const res = await request(app).get('/api/ingredients?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.data.docs.length).toBeLessThanOrEqual(5);
      expect(res.body.data.page).toBe(1);
    });

    it('TC2.2: should work with filter parameters', async () => {
      await seedIngredients();

      const res = await request(app).get('/api/ingredients?isActive=true');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.docs)).toBe(true);
    });
  });
});
