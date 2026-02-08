import mongoose from 'mongoose';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import app from '~/app';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { ROLE } from '~/shared/constants/role';
import { UNIT } from '~/shared/constants/unit';
import {
  AuthModel,
  DishModel,
  IngredientModel,
  UserModel
} from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

// Mock Cloudinary upload
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url:
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-dish.jpg',
      public_id: 'test-dish',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('POST /api/dishes', () => {
  let userToken: string;
  let userId: string;
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
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/test-dish.jpg',
        public_id: 'test-dish',
        format: 'jpg'
      } as any
    });

    // Create user
    const user = await UserModel.create({
      email: 'user@test.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });
    userId = user._id.toString();

    const hashedPassword = await hashPassword('123456');
    await AuthModel.create({
      user: user._id,
      provider: 'local',
      providerId: 'user@test.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    const userTokens = generateToken({
      id: user._id.toString(),
      role: ROLE.USER
    });
    userToken = userTokens.accessToken;

    // Create test ingredient
    const ingredient = await IngredientModel.create({
      name: 'Thịt bò',
      description: 'Thịt bò Úc',
      categories: ['Thịt'],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: [],
      isActive: true
    });
    ingredientId = ingredient._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should create dish successfully without image', async () => {
    const dishData = {
      name: 'Phở bò',
      description: 'Phở bò truyền thống',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }]),
      isActive: 'true'
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('description', dishData.description)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions)
      .field('isActive', dishData.isActive);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Tạo món ăn thành công');
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('name', 'Phở bò');
    expect(res.body.data).toHaveProperty('description', 'Phở bò truyền thống');
    expect(res.body.data.categories).toContain(DISH_CATEGORY.MAIN_COURSE);
    expect(res.body.data).toHaveProperty('isActive', true);
  });

  it('should create dish successfully with image', async () => {
    const dishData = {
      name: 'Bún chả',
      description: 'Bún chả Hà Nội',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 150, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Ướp thịt' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('description', dishData.description)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions)
      .attach('image', Buffer.from('fake-image-data'), 'test-dish.jpg');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('name', 'Bún chả');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 401 when no token provided', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(401);
  });

  it('should create dish with ingredient that has nutrition', async () => {
    // Create ingredient with nutrition
    const ingredientWithNutrition = await IngredientModel.create({
      name: 'Cà rốt',
      description: 'Cà rốt tươi',
      categories: ['Rau củ'],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: [],
      isActive: true,
      nutrition: {
        nutrients: {
          calories: { value: 41, unit: UNIT.KILOCALORIE },
          carbs: { value: 10, unit: UNIT.GRAM },
          fat: { value: 0.2, unit: UNIT.GRAM },
          protein: { value: 0.9, unit: UNIT.GRAM },
          fiber: { value: 2.8, unit: UNIT.GRAM },
          sodium: { value: 69, unit: UNIT.MILLIGRAM },
          cholesterol: { value: 0, unit: UNIT.MILLIGRAM }
        }
      }
    });

    const dishData = {
      name: 'Salad cà rốt',
      categories: JSON.stringify([DISH_CATEGORY.APPETIZER]),
      ingredients: JSON.stringify([
        {
          ingredientId: ingredientWithNutrition._id.toString(),
          units: [{ value: 100, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Bào cà rốt' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('name', 'Salad cà rốt');
    expect(res.body.data.ingredients[0]).toHaveProperty('nutrients');
    expect(res.body.data.ingredients[0].nutrients).toHaveProperty('calories');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when name is too short', async () => {
    const dishData = {
      name: 'P',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should return 400 when name is missing', async () => {
    const dishData = {
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should return 400 when categories is missing', async () => {
    const dishData = {
      name: 'Phở bò',
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should return 400 when ingredients is missing', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should return 400 when instructions is missing', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients);

    expect(res.status).toBe(400);
  });

  it('should return 400 when category is invalid', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify(['INVALID_CATEGORY']),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should handle malformed JSON in categories field', async () => {
    const dishData = {
      name: 'Phở bò',
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', '{invalid-json}')
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should return 400 when ingredient ID is invalid', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId: 'invalid-id',
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 404 when ingredient does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId: nonExistentId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  // ============ ERROR CASES (500) ============
  it('should return 500 when image upload fails', async () => {
    // Mock upload to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    });

    const dishData = {
      name: 'Phở bò',
      description: 'Phở bò truyền thống',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('description', dishData.description)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions)
      .attach('image', Buffer.from('fake-image-data'), 'test-dish.jpg');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tải ảnh lên thất bại');
  });

  it('should return 500 when dish creation fails', async () => {
    // Mock DishModel.create to return null
    vi.spyOn(DishModel, 'create').mockResolvedValueOnce(null as any);

    const dishData = {
      name: 'Phở bò',
      description: 'Phở bò truyền thống',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('description', dishData.description)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tạo món ăn thất bại');

    // Restore original function
    vi.spyOn(DishModel, 'create').mockRestore();
  });

  it('should handle malformed JSON in categories gracefully', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: '{invalid json',
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should handle malformed JSON in ingredients gracefully', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: '{invalid json',
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }])
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should handle malformed JSON in instructions gracefully', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: '{invalid json'
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions);

    expect(res.status).toBe(400);
  });

  it('should handle malformed JSON in tags gracefully', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: JSON.stringify([DISH_CATEGORY.MAIN_COURSE]),
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]),
      instructions: JSON.stringify([{ step: 1, description: 'Luộc xương' }]),
      tags: '{invalid json'
    };

    const res = await request(app)
      .post('/api/dishes')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', dishData.name)
      .field('categories', dishData.categories)
      .field('ingredients', dishData.ingredients)
      .field('instructions', dishData.instructions)
      .field('tags', dishData.tags);

    expect(res.status).toBe(400);
  });
});
