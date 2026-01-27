import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { AuthModel, IngredientModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { ROLE } from '~/shared/constants/role';

import { ingredientSeeds, seedIngredients } from '../seed-data';

describe('DELETE /api/ingredients/bulk', () => {
  let nutritionistToken: string;
  let userToken: string;

  // Helper function to get access token
  const getAccessToken = async (email: string, password: string): Promise<string> => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    return res.body.data.accessToken;
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }

    // Create test users
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});

    // Create nutritionist user
    const nutritionist = await UserModel.create({
      email: 'nutritionist@test.com',
      name: 'Test Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });

    const hashedPassword = await hashPassword('password123');
    await AuthModel.create({
      user: nutritionist._id,
      provider: 'local',
      providerId: 'nutritionist@test.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    // Create regular user
    const regularUser = await UserModel.create({
      email: 'user@test.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });

    await AuthModel.create({
      user: regularUser._id,
      provider: 'local',
      providerId: 'user@test.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    // Get tokens
    nutritionistToken = await getAccessToken('nutritionist@test.com', 'password123');
    userToken = await getAccessToken('user@test.com', 'password123');
  });

  beforeEach(async () => {
    await IngredientModel.deleteMany({});
    await seedIngredients();
  });

  afterAll(async () => {
    await IngredientModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ==================== HAPPY PATH ====================
  describe('Happy Path', () => {
    it('TC1.1: should delete multiple ingredients successfully', async () => {
      const ingredientIds = [
        ingredientSeeds[0]._id.toString(),
        ingredientSeeds[1]._id.toString(),
        ingredientSeeds[2]._id.toString()
      ];

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: ingredientIds });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', `${res.body.data.deletedCount} ingredient(s) deleted successfully`);
      expect(res.body.data).toHaveProperty('deletedCount', 3);

      // Verify ingredients are deleted from database
      for (const id of ingredientIds) {
        const deletedIngredient = await IngredientModel.findById(id);
        expect(deletedIngredient).toBeNull();
      }
    });

    it('TC1.2: should delete single ingredient via bulk delete', async () => {
      const ingredientIds = [ingredientSeeds[0]._id.toString()];

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: ingredientIds });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('deletedCount', 1);
    });

    it('TC1.3: should delete all provided valid ingredients', async () => {
      const allIngredientIds = ingredientSeeds.map(seed => seed._id.toString());

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: allIngredientIds });

      expect(res.status).toBe(200);
      expect(res.body.data.deletedCount).toBe(allIngredientIds.length);

      // Verify all are deleted
      const remainingCount = await IngredientModel.countDocuments();
      expect(remainingCount).toBe(0);
    });
  });

  // ==================== VALIDATION ====================
  describe('Validation', () => {
    it('TC2.1: should return 400 when ids array is empty', async () => {
      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: [] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.2: should return 400 when ids is not an array', async () => {
      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: 'not-an-array' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.3: should return 400 when ids array contains invalid ID format', async () => {
      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: ['invalid-id', 'another-invalid-id'] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.4: should return 400 when ids array contains mix of valid and invalid IDs', async () => {
      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: [ingredientSeeds[0]._id.toString(), 'invalid-id'] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.5: should return 400 when ids field is missing', async () => {
      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });
  });

  // ==================== AUTHENTICATION & AUTHORIZATION ====================
  describe('Authentication & Authorization', () => {
    it('TC3.1: should return 401 when no token provided', async () => {
      const ingredientIds = [ingredientSeeds[0]._id.toString()];

      const res = await request(app)
        .delete('/api/ingredients')
        .send({ ids: ingredientIds });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC3.2: should return 401 when token is invalid', async () => {
      const ingredientIds = [ingredientSeeds[0]._id.toString()];

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', 'Bearer invalid-token')
        .send({ ids: ingredientIds });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC3.3: should return 403 when regular user tries to bulk delete', async () => {
      const ingredientIds = [ingredientSeeds[0]._id.toString()];

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ids: ingredientIds });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('status', 'failed');
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('TC4.1: should handle partial deletion when some IDs do not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const ingredientIds = [
        ingredientSeeds[0]._id.toString(),
        nonExistentId,
        ingredientSeeds[1]._id.toString()
      ];

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: ingredientIds });

      // Should still delete the existing ones
      expect(res.status).toBe(200);
      expect(res.body.data.deletedCount).toBe(2);
    });

    it('TC4.2: should handle duplicate IDs in the array', async () => {
      const ingredientId = ingredientSeeds[0]._id.toString();
      const ingredientIds = [ingredientId, ingredientId, ingredientId];

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: ingredientIds });

      expect(res.status).toBe(200);
      expect(res.body.data.deletedCount).toBe(1);

      // Verify ingredient is deleted
      const deletedIngredient = await IngredientModel.findById(ingredientId);
      expect(deletedIngredient).toBeNull();
    });

    it('TC4.3: should return 0 deletedCount when all IDs are non-existent', async () => {
      const nonExistentIds = [
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString()
      ];

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: nonExistentIds });

      expect(res.status).toBe(200);
      expect(res.body.data.deletedCount).toBe(0);
    });

    it('TC4.4: should maintain database integrity after bulk deletion', async () => {
      const ingredientIds = [
        ingredientSeeds[0]._id.toString(),
        ingredientSeeds[1]._id.toString()
      ];

      const initialCount = await IngredientModel.countDocuments();

      await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: ingredientIds });

      const finalCount = await IngredientModel.countDocuments();
      expect(finalCount).toBe(initialCount - 2);
    });

    it('TC4.5: should handle large number of IDs', async () => {
      // Create many ingredients
      const manyIngredients = [];
      for (let i = 0; i < 50; i++) {
        manyIngredients.push({
          name: `Test Ingredient ${i}`,
          category: 'Test',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10
        });
      }
      const created = await IngredientModel.insertMany(manyIngredients);
      const ingredientIds = created.map(ing => ing._id.toString());

      const res = await request(app)
        .delete('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send({ ids: ingredientIds });

      expect(res.status).toBe(200);
      expect(res.body.data.deletedCount).toBe(50);
    });
  });
});
