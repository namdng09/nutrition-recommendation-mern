import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { IngredientModel } from '~/shared/database/models';

import { ingredientSeeds, seedIngredients } from '../seed-data';

describe('GET /api/ingredients/:id', () => {
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
    it('TC1.1: should return ingredient successfully with valid ID', async () => {
      await seedIngredients();
      const ingredientId = ingredientSeeds[0]._id.toString();

      const res = await request(app).get(`/api/ingredients/${ingredientId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', 'Ingredient retrieved successfully');
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('category');
      expect(res.body.data).toHaveProperty('unit');
      expect(res.body.data).toHaveProperty('caloriesPer100g');
      expect(res.body.data).toHaveProperty('protein');
      expect(res.body.data).toHaveProperty('isActive');
    });
  });

  // ==================== VALIDATION ====================
  describe('Validation', () => {
    it('TC2.1: should return 400 with invalid ingredient ID format', async () => {
      const res = await request(app).get('/api/ingredients/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
      expect(res.body.message).toContain('Invalid ingredient ID format');
    });

    it('TC2.2: should return 404 when ingredient not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app).get(`/api/ingredients/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('status', 'failed');
      expect(res.body.message).toContain('Ingredient not found');
    });
  });
});
