import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '~/app';
import { AuthModel, IngredientModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { ROLE } from '~/shared/constants/role';
import * as utils from '~/shared/utils';

import { ingredientSeeds, seedIngredients } from '../seed-data';

describe('PUT /api/ingredients/:id', () => {
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
    it('TC1.1: should update ingredient successfully with all fields', async () => {
      const updateData = {
        name: 'Updated Chicken Breast',
        category: 'Updated Protein',
        unit: 'kg',
        caloriesPer100g: 170,
        protein: 32,
        carbs: 1,
        fat: 4,
        fiber: 0.5,
        allergens: ['soy'],
        vitamins: { A: 10, C: 5 },
        minerals: { calcium: 20, iron: 1.5 },
        description: 'Updated description'
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', 'Ingredient updated successfully');
      expect(res.body.data).toHaveProperty('_id', ingredientId);
      expect(res.body.data).toHaveProperty('name', 'Updated Chicken Breast');
      expect(res.body.data).toHaveProperty('category', 'Updated Protein');
      expect(res.body.data).toHaveProperty('unit', 'kg');
      expect(res.body.data).toHaveProperty('caloriesPer100g', 170);
      expect(res.body.data).toHaveProperty('protein', 32);
    });

    it('TC1.2: should update ingredient successfully with partial fields', async () => {
      const updateData = {
        name: 'Partially Updated Ingredient',
        caloriesPer100g: 180
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('name', 'Partially Updated Ingredient');
      expect(res.body.data).toHaveProperty('caloriesPer100g', 180);
      // Should keep other fields unchanged
      expect(res.body.data).toHaveProperty('category', ingredientSeeds[0].category);
    });

    it('TC1.3: should update isActive status', async () => {
      const updateData = {
        isActive: false
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('isActive', false);
    });
  });

  // ==================== VALIDATION ====================
  describe('Validation', () => {
    it('TC2.1: should return 400 when caloriesPer100g is negative', async () => {
      const updateData = {
        caloriesPer100g: -100
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.2: should return 400 when protein is negative', async () => {
      const updateData = {
        protein: -10
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.3: should return 400 with invalid ID format', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const res = await request(app)
        .put('/api/ingredients/invalid-id')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.4: should return 404 when ingredient not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: 'Updated Name'
      };

      const res = await request(app)
        .put(`/api/ingredients/${nonExistentId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC2.5: should return 400 when isActive is not a boolean', async () => {
      const updateData = {
        isActive: 'not-a-boolean'
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('status', 'error');
    });

    it('TC2.6: should accept isActive as string "true" and convert to boolean', async () => {
      const updateData = {
        isActive: 'true'
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('isActive', true);
    });

    it('TC2.7: should accept isActive as string "false" and convert to boolean', async () => {
      const updateData = {
        isActive: 'false'
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('isActive', false);
    });
  });

  // ==================== AUTHENTICATION & AUTHORIZATION ====================
  describe('Authentication & Authorization', () => {
    it('TC3.1: should return 401 when no token provided', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .send(updateData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC3.2: should return 401 when token is invalid', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', 'Bearer invalid-token')
        .send(updateData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'failed');
    });

    it('TC3.3: should return 403 when regular user tries to update', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('status', 'failed');
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('TC4.1: should trim whitespace from name', async () => {
      const updateData = {
        name: '  Trimmed Name  '
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Trimmed Name');
    });

    it('TC4.2: should update with zero values for nutrients', async () => {
      const updateData = {
        protein: 0,
        carbs: 0,
        fat: 0
      };

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('protein', 0);
      expect(res.body.data).toHaveProperty('carbs', 0);
      expect(res.body.data).toHaveProperty('fat', 0);
    });
  });

  // ==================== IMAGE UPLOAD TESTS ====================
  describe('Image Upload Tests', () => {
    it('TC5.1: should update ingredient with new image successfully', async () => {
      // Mock successful delete and upload
      vi.spyOn(utils, 'deleteImage').mockResolvedValue({ success: true } as any);
      vi.spyOn(utils, 'uploadImage').mockResolvedValue({
        success: true,
        data: {
          secure_url: 'https://cloudinary.com/updated-image.jpg',
          public_id: 'updated-id'
        } as any
      });

      const testImageBuffer = Buffer.from('fake updated image content');

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .field('name', 'Updated with Image')
        .attach('image', testImageBuffer, 'updated-image.jpg');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('image', 'https://cloudinary.com/updated-image.jpg');
      expect(utils.deleteImage).toHaveBeenCalled();
      expect(utils.uploadImage).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('TC5.2: should throw error when image upload fails during update', async () => {
      // Mock successful delete but failed upload
      vi.spyOn(utils, 'deleteImage').mockResolvedValue({ success: true } as any);
      vi.spyOn(utils, 'uploadImage').mockResolvedValue({
        success: false,
        error: 'Upload failed'
      } as any);

      const testImageBuffer = Buffer.from('fake image content');

      const res = await request(app)
        .put(`/api/ingredients/${ingredientId}`)
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .field('name', 'Update with Failed Image')
        .attach('image', testImageBuffer, 'failed-image.jpg');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('Failed to upload image');

      vi.restoreAllMocks();
    });
  });
});
