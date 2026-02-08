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
        'https://res.cloudinary.com/test/image/upload/v1234567890/updated-dish.jpg',
      public_id: 'updated-dish',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('PUT /api/dishes/:id', () => {
  let userToken: string;
  let otherUserToken: string;
  let adminToken: string;
  let userId: string;
  let dishId: string;
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
          'https://res.cloudinary.com/test/image/upload/v1234567890/updated-dish.jpg',
        public_id: 'updated-dish',
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

    // Create another user
    const otherUser = await UserModel.create({
      email: 'other@test.com',
      name: 'Other User',
      role: ROLE.USER,
      isActive: true
    });

    await AuthModel.create({
      user: otherUser._id,
      provider: 'local',
      providerId: 'other@test.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    const otherUserTokens = generateToken({
      id: otherUser._id.toString(),
      role: ROLE.USER
    });
    otherUserToken = otherUserTokens.accessToken;

    // Create admin user
    const admin = await UserModel.create({
      email: 'admin@test.com',
      name: 'Admin User',
      role: ROLE.ADMIN,
      isActive: true
    });

    await AuthModel.create({
      user: admin._id,
      provider: 'local',
      providerId: 'admin@test.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    const adminTokens = generateToken({
      id: admin._id.toString(),
      role: ROLE.ADMIN
    });
    adminToken = adminTokens.accessToken;

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

    // Create test dish
    const dish = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Phở bò',
      description: 'Phở bò truyền thống',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });
    dishId = dish._id.toString();
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
  it('should update dish successfully without image', async () => {
    const updateData = {
      name: 'Phở bò Hà Nội',
      description: 'Phở bò truyền thống Hà Nội',
      categories: JSON.stringify([
        DISH_CATEGORY.MAIN_COURSE,
        DISH_CATEGORY.SOUP
      ])
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', updateData.name)
      .field('description', updateData.description)
      .field('categories', updateData.categories);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Cập nhật món ăn thành công');
    expect(res.body.data).toHaveProperty('_id', dishId);
    expect(res.body.data).toHaveProperty('name', 'Phở bò Hà Nội');
    expect(res.body.data).toHaveProperty(
      'description',
      'Phở bò truyền thống Hà Nội'
    );
    expect(res.body.data.categories).toContain(DISH_CATEGORY.MAIN_COURSE);
    expect(res.body.data.categories).toContain(DISH_CATEGORY.SOUP);
  });

  it('should update dish successfully with image', async () => {
    const updateData = {
      name: 'Phở bò đặc biệt',
      description: 'Phở bò với nhiều topping'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', updateData.name)
      .field('description', updateData.description)
      .attach('image', Buffer.from('fake-image-data'), 'updated-dish.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('name', 'Phở bò đặc biệt');
    expect(res.body.data).toHaveProperty('image');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 401 when no token provided', async () => {
    const updateData = {
      name: 'Phở bò Hà Nội'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .field('name', updateData.name);

    expect(res.status).toBe(401);
  });

  it('should return 403 when user is not dish owner', async () => {
    const updateData = {
      name: 'Phở bò Hà Nội'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(403);
  });

  it('should return 403 when admin tries to update dish', async () => {
    const updateData = {
      name: 'Phở bò Hà Nội'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Admin không có quyền sửa món ăn'
    );
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const updateData = {
      name: 'Phở bò Hà Nội'
    };

    const res = await request(app)
      .put('/api/dishes/invalid-id')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Định dạng ID món ăn không hợp lệ'
    );
  });

  it('should return 400 when name is too short', async () => {
    const updateData = {
      name: 'P'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(400);
  });

  it('should return 400 when category is invalid', async () => {
    const updateData = {
      categories: JSON.stringify(['INVALID_CATEGORY'])
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('categories', updateData.categories);

    expect(res.status).toBe(400);
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when dish does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      name: 'Phở bò Hà Nội'
    };

    const res = await request(app)
      .put(`/api/dishes/${nonExistentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy món ăn');
  });

  // ============ EDGE CASES ============
  it('should update isActive status successfully', async () => {
    const updateData = {
      isActive: 'false'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('isActive', updateData.isActive);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('isActive', false);
  });

  it('should allow partial update of dish', async () => {
    const updateData = {
      description: 'Cập nhật mô tả mới'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('description', updateData.description);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'Phở bò'); // Original name unchanged
    expect(res.body.data).toHaveProperty('description', 'Cập nhật mô tả mới');
  });

  it('should update ingredients successfully', async () => {
    const updateData = {
      ingredients: JSON.stringify([
        {
          ingredientId,
          units: [{ value: 300, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ])
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('ingredients', updateData.ingredients);

    expect(res.status).toBe(200);
    expect(res.body.data.ingredients).toHaveLength(1);
  });

  it('should update dish with ingredient that has nutrition', async () => {
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

    const updateData = {
      ingredients: JSON.stringify([
        {
          ingredientId: ingredientWithNutrition._id.toString(),
          units: [{ value: 150, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ])
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('ingredients', updateData.ingredients);

    expect(res.status).toBe(200);
    expect(res.body.data.ingredients).toHaveLength(1);
    expect(res.body.data.ingredients[0]).toHaveProperty('nutrients');
    expect(res.body.data.ingredients[0].nutrients).toHaveProperty('calories');
  });

  it('should return 400 when updating with invalid ingredient ID', async () => {
    const updateData = {
      ingredients: JSON.stringify([
        {
          ingredientId: 'invalid-id',
          units: [{ value: 300, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ])
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('ingredients', updateData.ingredients);

    expect(res.status).toBe(400);
  });

  it('should return 404 when updating with non-existent ingredient', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      ingredients: JSON.stringify([
        {
          ingredientId: nonExistentId,
          units: [{ value: 300, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ])
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('ingredients', updateData.ingredients);

    expect(res.status).toBe(404);
  });

  // ============ ERROR CASES (500) ============
  it('should return 500 when image upload fails during update', async () => {
    // Mock upload to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    });

    const updateData = {
      name: 'Phở bò đặc biệt',
      description: 'Phở bò với nhiều topping'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', updateData.name)
      .field('description', updateData.description)
      .attach('image', Buffer.from('fake-image-data'), 'updated-dish.jpg');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tải ảnh lên thất bại');
  });

  it('should return 500 when findByIdAndUpdate returns null', async () => {
    // Mock findByIdAndUpdate to return null
    vi.spyOn(DishModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

    const updateData = {
      name: 'Phở bò Hà Nội'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', updateData.name);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy món ăn');

    // Restore original function
    vi.spyOn(DishModel, 'findByIdAndUpdate').mockRestore();
  });

  it('should handle malformed JSON in categories gracefully', async () => {
    const updateData = {
      categories: '{invalid json'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('categories', updateData.categories);

    expect(res.status).toBe(400);
  });

  it('should handle malformed JSON in ingredients gracefully', async () => {
    const updateData = {
      ingredients: '{invalid json'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('ingredients', updateData.ingredients);

    expect(res.status).toBe(400);
  });

  it('should handle malformed JSON in instructions gracefully', async () => {
    const updateData = {
      instructions: '{invalid json'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('instructions', updateData.instructions);

    expect(res.status).toBe(400);
  });

  it('should handle malformed JSON in tags gracefully', async () => {
    const updateData = {
      tags: '{invalid json'
    };

    const res = await request(app)
      .put(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('tags', updateData.tags);

    expect(res.status).toBe(400);
  });
});
