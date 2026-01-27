import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { AuthModel, IngredientModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { ROLE } from '~/shared/constants/role';

import { ingredientSeeds, seedIngredients } from '../seed-data';

describe('DELETE /api/ingredients/:id', () => {
  let nutritionistToken: string;
  let userToken: string;
  let ingredientId: string;

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
    ingredientId = ingredientSeeds[0]._id.toString();
  });

  afterAll(async () => {
    await IngredientModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ==================== HAPPY PATH ====================
  describe('Happy Path', () => {
    it('TC1.1: should delete ingredient successfully', async () => {
      const res = await request(app)
        .delete(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', 'Ingredient deleted successfully');

      // Verify ingredient is deleted from database
      const deletedIngredient = await IngredientModel.findById(ingredientId);
      expect(deletedIngredient).toBeNull();
    });
  });

  // ==================== VALIDATION ====================
  describe('Validation', () => {
    it('TC2.1: should return 400 with invalid ID format', async () => {
      const res = await request(app)
        .delete('/api/ingredients/invalid-id')
        .set('Authorization', `Bearer ${nutritionistToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.2: should return 404 when ingredient not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/ingredients/${nonExistentId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.3: should return 404 when trying to delete already deleted ingredient', async () => {
      // Delete once
      await request(app)
        .delete(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`);

      // Try to delete again
      const res = await request(app)
        .delete(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('status', 'failed');
    });
  });

  // ==================== AUTHENTICATION & AUTHORIZATION ====================
  describe('Authentication & Authorization', () => {
    it('TC3.1: should return 401 when no token provided', async () => {
      const res = await request(app)
        .delete(`/api/ingredients/${ingredientId}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC3.2: should return 401 when token is invalid', async () => {
      const res = await request(app)
        .delete(`/api/ingredients/${ingredientId}`)
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC3.3: should return 403 when regular user tries to delete', async () => {
      const res = await request(app)
        .delete(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('status', 'failed');
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('TC4.1: should handle deletion of multiple different ingredients', async () => {
      const ingredient1Id = ingredientSeeds[0]._id.toString();
      const ingredient2Id = ingredientSeeds[1]._id.toString();

      // Delete first ingredient
      const res1 = await request(app)
        .delete(`/api/ingredients/${ingredient1Id}`)
        .set('Authorization', `Bearer ${nutritionistToken}`);

      expect(res1.status).toBe(200);

      // Delete second ingredient
      const res2 = await request(app)
        .delete(`/api/ingredients/${ingredient2Id}`)
        .set('Authorization', `Bearer ${nutritionistToken}`);

      expect(res2.status).toBe(200);

      // Verify both are deleted
      const deletedIngredient1 = await IngredientModel.findById(ingredient1Id);
      const deletedIngredient2 = await IngredientModel.findById(ingredient2Id);

      expect(deletedIngredient1).toBeNull();
      expect(deletedIngredient2).toBeNull();
    });

    it('TC4.2: should maintain database integrity after deletion', async () => {
      const initialCount = await IngredientModel.countDocuments();

      await request(app)
        .delete(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`);

      const finalCount = await IngredientModel.countDocuments();
      expect(finalCount).toBe(initialCount - 1);
    });
  });
});
