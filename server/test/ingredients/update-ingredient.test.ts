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
        'https://res.cloudinary.com/test/image/upload/v1234567890/updated-image.jpg',
      public_id: 'updated-image',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('PUT /api/ingredients/:id', () => {
  let nutritionistToken: string;
  let userToken: string;
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
    await IngredientModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/updated-image.jpg',
        public_id: 'updated-image',
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

    // Create test ingredient
    const ingredient = await IngredientModel.create({
      name: 'Cà chua',
      description: 'Cà chua tươi',
      categories: [INGREDIENT_CATEGORY.VEGETABLES],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: [],
      isActive: true
    });
    ingredientId = ingredient._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await IngredientModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('UC01 - should update ingredient successfully without image', async () => {
    const updateData = {
      name: 'Cà chua đỏ',
      description: 'Cà chua tươi ngon',
      categories: JSON.stringify([
        INGREDIENT_CATEGORY.VEGETABLES,
        INGREDIENT_CATEGORY.FRUITS
      ])
    };

    const res = await request(app)
      .put(`/api/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', updateData.name)
      .field('description', updateData.description)
      .field('categories', updateData.categories);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'Cập nhật nguyên liệu thành công'
    );
    expect(res.body.data).toHaveProperty('_id', ingredientId);
    expect(res.body.data).toHaveProperty('name', 'Cà chua đỏ');
    expect(res.body.data).toHaveProperty('description', 'Cà chua tươi ngon');
    expect(res.body.data.categories).toContain(INGREDIENT_CATEGORY.VEGETABLES);
    expect(res.body.data.categories).toContain(INGREDIENT_CATEGORY.FRUITS);
  });

  it('UC02 - should update ingredient successfully with image', async () => {
    const updateData = {
      name: 'Cà chua cherry',
      description: 'Cà chua bi'
    };

    const res = await request(app)
      .put(`/api/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', updateData.name)
      .field('description', updateData.description)
      .attach('image', Buffer.from('fake-image-data'), 'updated-image.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('name', 'Cà chua cherry');
    expect(res.body.data).toHaveProperty('image');
  });

  // ============ VALIDATION (400) ============
  it('UC03 - should return 400 when id format is invalid', async () => {
    const updateData = {
      name: 'Cà chua đỏ'
    };

    const res = await request(app)
      .put('/api/ingredients/invalid-id')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Định dạng ID nguyên liệu không hợp lệ'
    );
  });

  it('UC04 - should return 400 when name is number (Type Violation)', async () => {
    const updateData = {
      name: 1234
    };

    const res = await request(app)
      .put(`/api/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send(updateData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Tên nguyên liệu không hợp lệ');
  });

  it('UC05 - should return 400 when name is too short (Constraint Limits)', async () => {
    const updateData = {
      name: 'A'
    };

    const res = await request(app)
      .put(`/api/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Tên nguyên liệu phải có ít nhất 2 ký tự'
    );
  });

  // ============ NOT FOUND (404) ============
  it('UC06 - should return 404 when ingredient does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      name: 'Cà chua đỏ'
    };

    const res = await request(app)
      .put(`/api/ingredients/${nonExistentId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy nguyên liệu');
  });
});
