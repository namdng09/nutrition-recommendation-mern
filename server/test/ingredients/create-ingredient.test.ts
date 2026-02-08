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
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { ROLE } from '~/shared/constants/role';
import { UNIT } from '~/shared/constants/unit';
import {
  AuthModel,
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
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg',
      public_id: 'test-image',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('POST /api/ingredients', () => {
  let nutritionistToken: string;
  let userToken: string;

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
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg',
        public_id: 'test-image',
        format: 'jpg'
      } as any
    });

    // Create nutritionist user
    const nutritionist = await UserModel.create({
      email: 'nutritionist@test.com',
      name: 'Test Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });

    const hashedPassword = await hashPassword('123456');
    await AuthModel.create({
      user: nutritionist._id,
      provider: 'local',
      providerId: 'nutritionist@test.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    const nutritionistTokens = generateToken({
      id: nutritionist._id.toString(),
      role: ROLE.NUTRITIONIST
    });
    nutritionistToken = nutritionistTokens.accessToken;

    // Create regular user
    const user = await UserModel.create({
      email: 'user@test.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });

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
  });

  afterAll(async () => {
    // Clean up and close connection
    await IngredientModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should create ingredient successfully without image', async () => {
    const ingredientData = {
      name: 'Cà chua',
      description: 'Cà chua tươi',
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES]),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM }),
      units: JSON.stringify([{ value: 1, unit: 'quả', isDefault: true }]),
      allergens: JSON.stringify([]),
      isActive: 'true'
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('description', ingredientData.description)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit)
      .field('units', ingredientData.units)
      .field('allergens', ingredientData.allergens)
      .field('isActive', ingredientData.isActive);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Tạo nguyên liệu thành công');
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('name', 'Cà chua');
    expect(res.body.data).toHaveProperty('description', 'Cà chua tươi');
    expect(res.body.data.categories).toContain(INGREDIENT_CATEGORY.VEGETABLES);
    expect(res.body.data).toHaveProperty('isActive', true);
  });

  it('should create ingredient successfully with image', async () => {
    const ingredientData = {
      name: 'Thịt bò',
      description: 'Thịt bò Úc',
      categories: JSON.stringify([INGREDIENT_CATEGORY.MEAT]),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM }),
      allergens: JSON.stringify([])
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('description', ingredientData.description)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit)
      .field('allergens', ingredientData.allergens)
      .attach('image', Buffer.from('fake-image-data'), 'test-image.jpg');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('name', 'Thịt bò');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 401 when no token provided', async () => {
    const ingredientData = {
      name: 'Cà chua',
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES]),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .field('name', ingredientData.name)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(401);
  });

  it('should return 403 when user is not nutritionist', async () => {
    const ingredientData = {
      name: 'Cà chua',
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES]),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', ingredientData.name)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(403);
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when name is too short', async () => {
    const ingredientData = {
      name: 'C',
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES]),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(400);
  });

  it('should return 400 when name is missing', async () => {
    const ingredientData = {
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES]),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(400);
  });

  it('should return 400 when categories is missing', async () => {
    const ingredientData = {
      name: 'Cà chua',
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(400);
  });

  it('should return 400 when baseUnit is missing', async () => {
    const ingredientData = {
      name: 'Cà chua',
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES])
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('categories', ingredientData.categories);

    expect(res.status).toBe(400);
  });

  it('should return 400 when category is invalid', async () => {
    const ingredientData = {
      name: 'Cà chua',
      categories: JSON.stringify(['INVALID_CATEGORY']),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(400);
  });

  it('should return 400 when baseUnit amount is negative', async () => {
    const ingredientData = {
      name: 'Cà chua',
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES]),
      baseUnit: JSON.stringify({ amount: -100, unit: UNIT.GRAM })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(400);
  });

  it('should return 400 when baseUnit is missing unit', async () => {
    const ingredientData = {
      name: 'Cà chua',
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES]),
      baseUnit: JSON.stringify({ amount: 100 })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(400);
  });

  it('should handle malformed JSON in categories field', async () => {
    const ingredientData = {
      name: 'Cà chua',
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM })
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('categories', '{invalid-json}') // Malformed JSON
      .field('baseUnit', ingredientData.baseUnit);

    expect(res.status).toBe(400);
  });

  // ============ ERROR CASES (500) ============
  it('should return 500 when image upload fails', async () => {
    // Mock upload to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    });

    const ingredientData = {
      name: 'Thịt bò',
      description: 'Thịt bò Úc',
      categories: JSON.stringify([INGREDIENT_CATEGORY.MEAT]),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM }),
      allergens: JSON.stringify([])
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('description', ingredientData.description)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit)
      .field('allergens', ingredientData.allergens)
      .attach('image', Buffer.from('fake-image-data'), 'test-image.jpg');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tải ảnh lên thất bại');
  });

  it('should return 500 when ingredient creation fails', async () => {
    // Mock IngredientModel.create to return null
    vi.spyOn(IngredientModel, 'create').mockResolvedValueOnce(null as any);

    const ingredientData = {
      name: 'Cà chua',
      description: 'Cà chua tươi',
      categories: JSON.stringify([INGREDIENT_CATEGORY.VEGETABLES]),
      baseUnit: JSON.stringify({ amount: 100, unit: UNIT.GRAM }),
      allergens: JSON.stringify([])
    };

    const res = await request(app)
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', ingredientData.name)
      .field('description', ingredientData.description)
      .field('categories', ingredientData.categories)
      .field('baseUnit', ingredientData.baseUnit)
      .field('allergens', ingredientData.allergens);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tạo nguyên liệu thất bại');

    // Restore original function
    vi.spyOn(IngredientModel, 'create').mockRestore();
  });
});
