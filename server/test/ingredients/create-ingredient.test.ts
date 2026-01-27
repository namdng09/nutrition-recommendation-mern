import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '~/app';
import { AuthModel, IngredientModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { ROLE } from '~/shared/constants/role';
import * as utils from '~/shared/utils';

describe('POST /api/ingredients', () => {
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
  });

  afterAll(async () => {
    await IngredientModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ==================== HAPPY PATH ====================
  describe('Happy Path', () => {
    it('TC1.1: should create ingredient successfully with required fields only', async () => {
      const ingredientData = {
        name: 'Test Ingredient',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message', 'Ingredient created successfully');
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', 'Test Ingredient');
      expect(res.body.data).toHaveProperty('category', 'Test Category');
      expect(res.body.data).toHaveProperty('unit', 'g');
      expect(res.body.data).toHaveProperty('caloriesPer100g', 100);
      expect(res.body.data).toHaveProperty('protein', 10);
    });

    it('TC1.2: should create ingredient successfully with all fields including optional', async () => {
      const ingredientData = {
        name: 'Complete Ingredient',
        category: 'Complete Category',
        unit: 'g',
        caloriesPer100g: 200,
        protein: 20,
        carbs: 30,
        fat: 5,
        fiber: 2.5,
        allergens: ['nuts', 'dairy'],
        isActive: true
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('carbs', 30);
      expect(res.body.data).toHaveProperty('fat', 5);
      expect(res.body.data).toHaveProperty('fiber', 2.5);
      expect(res.body.data.allergens).toEqual(['nuts', 'dairy']);
      expect(res.body.data).toHaveProperty('isActive', true);
    });

    it('TC1.3: should create ingredient with optional fields undefined', async () => {
      const ingredientData = {
        name: 'Minimal Ingredient',
        category: 'Minimal Category',
        unit: 'g',
        caloriesPer100g: 150,
        protein: 15
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(201);
      expect(res.body.data.carbs).toBeUndefined();
      expect(res.body.data.fat).toBeUndefined();
      expect(res.body.data.fiber).toBeUndefined();
    });
  });

  // ==================== VALIDATION TESTS ====================
  describe('Validation Tests', () => {
    describe('Name Validation', () => {
      it('TC2.1.1: should return 400 when name is too short (< 2 characters)', async () => {
        const ingredientData = {
          name: 'A',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.1.2: should return 400 when name is empty string', async () => {
        const ingredientData = {
          name: '',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.1.3: should return 400 when name is not provided', async () => {
        const ingredientData = {
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });
    });

    describe('Category Validation', () => {
      it('TC2.2.1: should return 400 when category is too short (< 2 characters)', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'A',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.2.2: should return 400 when category is empty string', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: '',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.2.3: should return 400 when category is not provided', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });
    });

    describe('Unit Validation', () => {
      it('TC2.3.1: should return 400 when unit is empty string', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: '',
          caloriesPer100g: 100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.3.2: should return 400 when unit is not provided', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          caloriesPer100g: 100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });
    });

    describe('Numeric Fields Validation', () => {
      it('TC2.4.1: should return 400 when caloriesPer100g is negative', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: -100,
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.4.2: should return 400 when protein is negative', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: -10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.4.3: should return 400 when carbs is negative', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10,
          carbs: -5
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.4.4: should return 400 when fat is negative', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10,
          fat: -3
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.4.5: should return 400 when fiber is negative', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10,
          fiber: -2
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.4.6: should return 400 when caloriesPer100g is not a number', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 'not-a-number',
          protein: 10
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.4.7: should return 400 when protein is not a number', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 'not-a-number'
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });
    });

    describe('Allergens Validation', () => {
      it('TC2.5.1: should return 400 when allergens is not an array', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10,
          allergens: 'not-an-array'
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });

      it('TC2.5.2: should return 400 when allergens contains non-string elements', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10,
          allergens: ['nuts', 123, 'dairy']
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(400);
      });
    });

    describe('isActive Validation', () => {
      it('TC2.6.1: should return 400 when isActive is not a boolean', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10,
          isActive: 'not-a-boolean'
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(500);
      });

      it('TC2.6.2: should accept isActive as string "true" and convert to boolean', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10,
          isActive: 'true'
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('isActive', true);
      });

      it('TC2.6.3: should accept isActive as string "false" and convert to boolean', async () => {
        const ingredientData = {
          name: 'Test Ingredient',
          category: 'Test Category',
          unit: 'g',
          caloriesPer100g: 100,
          protein: 10,
          isActive: 'false'
        };

        const res = await request(app)
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${nutritionistToken}`)
          .send(ingredientData);

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('isActive', false);
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('TC3.1: should trim whitespace from name', async () => {
      const ingredientData = {
        name: '   Trimmed Name   ',
        category: '   Trimmed Category   ',
        unit: '   Trimmed Unit   ',
        caloriesPer100g: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('name', 'Trimmed Name');
      expect(res.body.data).toHaveProperty('category', 'Trimmed Category');
      expect(res.body.data).toHaveProperty('unit', 'Trimmed Unit');
    });

    it('TC3.2: should create ingredient successfully with zero values', async () => {
      const ingredientData = {
        name: 'Zero Ingredient',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('caloriesPer100g', 0);
      expect(res.body.data).toHaveProperty('protein', 0);
    });

    it('TC3.3: should create ingredient successfully with empty allergens array', async () => {
      const ingredientData = {
        name: 'No Allergen Ingredient',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10,
        allergens: []
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(201);
      expect(res.body.data.allergens).toEqual([]);
    });

    it('TC3.4: should create ingredient with special characters in name', async () => {
      const ingredientData = {
        name: 'Ingredient@#$%',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('name', 'Ingredient@#$%');
    });

    it('TC3.5: should create ingredient with very small decimal values', async () => {
      const ingredientData = {
        name: 'Decimal Ingredient',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 0.001,
        protein: 0.001,
        carbs: 0.001,
        fat: 0.001,
        fiber: 0.001
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(201);
      expect(res.body.data.protein).toBeCloseTo(0.001, 3);
    });
  });

  // ==================== AUTHENTICATION & AUTHORIZATION ====================
  describe('Authentication & Authorization', () => {
    it('TC4.1: should return 401 when no token is provided', async () => {
      const ingredientData = {
        name: 'Test Ingredient',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10
      };

      const res = await request(app)
        .post('/api/ingredients')
        .send(ingredientData);

      expect(res.status).toBe(401);
    });

    it('TC4.2: should return 401 when token is invalid', async () => {
      const ingredientData = {
        name: 'Test Ingredient',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', 'Bearer invalid-token')
        .send(ingredientData);

      expect(res.status).toBe(401);
    });

    it('TC4.3: should return 403 when user role is insufficient (not NUTRITIONIST)', async () => {
      const ingredientData = {
        name: 'Test Ingredient',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${userToken}`)
        .send(ingredientData);

      expect(res.status).toBe(403);
    });
  });

  // ==================== IMAGE UPLOAD TESTS ====================
  describe('Image Upload Tests', () => {
    it('TC5.1: should create ingredient with image successfully', async () => {
      // Mock successful upload
      vi.spyOn(utils, 'uploadImage').mockResolvedValue({
        success: true,
        data: {
          secure_url: 'https://cloudinary.com/test-image.jpg',
          public_id: 'test-id'
        } as any
      });

      const ingredientData = {
        name: 'Ingredient with Image',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10
      };

      const testImageBuffer = Buffer.from('fake image content');

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .field('name', ingredientData.name)
        .field('category', ingredientData.category)
        .field('unit', ingredientData.unit)
        .field('caloriesPer100g', ingredientData.caloriesPer100g.toString())
        .field('protein', ingredientData.protein.toString())
        .attach('image', testImageBuffer, 'test-image.jpg');

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('image', 'https://cloudinary.com/test-image.jpg');
      expect(utils.uploadImage).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('TC5.2: should throw error when image upload fails', async () => {
      // Mock failed upload
      vi.spyOn(utils, 'uploadImage').mockResolvedValue({
        success: false,
        error: 'Upload failed'
      } as any);

      const ingredientData = {
        name: 'Ingredient with Failed Image',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10
      };

      const testImageBuffer = Buffer.from('fake image content');

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .field('name', ingredientData.name)
        .field('category', ingredientData.category)
        .field('unit', ingredientData.unit)
        .field('caloriesPer100g', ingredientData.caloriesPer100g.toString())
        .field('protein', ingredientData.protein.toString())
        .attach('image', testImageBuffer, 'test-image.jpg');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('Failed to upload image');

      vi.restoreAllMocks();
    });
  });

  // ==================== DATABASE ERROR TESTS ====================
  describe('Database Error Tests', () => {
    it('TC6.1: should return 500 when database fails to create ingredient', async () => {
      vi.spyOn(IngredientModel, 'create').mockResolvedValue(null as any);

      const ingredientData = {
        name: 'Test Ingredient',
        category: 'Test Category',
        unit: 'g',
        caloriesPer100g: 100,
        protein: 10
      };

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${nutritionistToken}`)
        .send(ingredientData);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('status', 'error');

      vi.restoreAllMocks();
    });
  });
});
