import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '~/app';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { ROLE } from '~/shared/constants/role';
import { UNIT } from '~/shared/constants/unit';
import { AuthModel, CollectionModel, DishModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

// Mock Cloudinary upload
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test-collection.jpg',
      public_id: 'test-collection',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('POST /api/collections', () => {
  let nutritionistToken: string;
  let userToken: string;
  let nutritionistId: string;
  let nutritionistName: string;
  let dishId: string;

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
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test-collection.jpg',
        public_id: 'test-collection',
        format: 'jpg'
      } as any
    });

    // Create nutritionist
    const nutritionist = await UserModel.create({
      email: 'nutritionist@test.com',
      name: 'Test Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });
    nutritionistId = nutritionist._id.toString();
    nutritionistName = nutritionist.name;

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

    // Create test dish
    const dish = await DishModel.create({
      user: { _id: nutritionistId, name: nutritionistName },
      name: 'Phở bò',
      description: 'Phở bò truyền thống',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: 'Thịt bò',
          nutrients: {
            calories: { value: 250, unit: UNIT.KILOCALORIE },
            carbs: { value: 0, unit: UNIT.GRAM },
            fat: { value: 15, unit: UNIT.GRAM },
            protein: { value: 26, unit: UNIT.GRAM },
            fiber: { value: 0, unit: UNIT.GRAM },
            sodium: { value: 72, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 90, unit: UNIT.MILLIGRAM }
          },
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });
    dishId = dish._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should create collection successfully without image and dishes', async () => {
    const collectionData = {
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giúp giảm cân hiệu quả',
      isPublic: 'true',
      tags: JSON.stringify(['giảm cân', 'healthy'])
    };

    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', collectionData.name)
      .field('description', collectionData.description)
      .field('isPublic', collectionData.isPublic)
      .field('tags', collectionData.tags);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Tạo bộ sưu tập thành công');
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('name', 'Món ăn giảm cân');
    expect(res.body.data).toHaveProperty('description', 'Bộ sưu tập các món ăn giúp giảm cân hiệu quả');
    expect(res.body.data).toHaveProperty('isPublic', true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('_id', nutritionistId);
    expect(res.body.data.user).toHaveProperty('name', nutritionistName);
    expect(res.body.data.tags).toContain('giảm cân');
    expect(res.body.data.tags).toContain('healthy');
    expect(res.body.data.dishes).toHaveLength(0);
  });

  it('should create collection successfully with image', async () => {
    const collectionData = {
      name: 'Món ăn tăng cơ',
      description: 'Bộ sưu tập món ăn cho người tập gym',
      isPublic: 'false'
    };

    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', collectionData.name)
      .field('description', collectionData.description)
      .field('isPublic', collectionData.isPublic)
      .attach('image', Buffer.from('fake-image-data'), 'test-collection.jpg');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('name', 'Món ăn tăng cơ');
    expect(res.body.data).toHaveProperty('isPublic', false);
    expect(res.body.data).toHaveProperty('image', 'https://res.cloudinary.com/test/image/upload/v1234567890/test-collection.jpg');
  });

  it('should create collection successfully with dishes', async () => {
    const collectionData = {
      name: 'Món ăn Việt',
      description: 'Các món ăn truyền thống Việt Nam',
      dishes: JSON.stringify([dishId])
    };

    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', collectionData.name)
      .field('description', collectionData.description)
      .field('dishes', collectionData.dishes);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('name', 'Món ăn Việt');
    expect(res.body.data.dishes).toHaveLength(1);
    expect(res.body.data.dishes[0]).toHaveProperty('dishId', dishId);
    expect(res.body.data.dishes[0]).toHaveProperty('name', 'Phở bò');
    expect(res.body.data.dishes[0]).toHaveProperty('calories', 250);
    expect(res.body.data.dishes[0]).toHaveProperty('addedAt');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 403 when user is not nutritionist', async () => {
    const collectionData = {
      name: 'Món ăn giảm cân'
    };

    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', collectionData.name);

    expect(res.status).toBe(403);
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when dish ID format is invalid', async () => {
    const collectionData = {
      name: 'Món ăn Việt',
      dishes: JSON.stringify(['invalid-id'])
    };

    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', collectionData.name)
      .field('dishes', collectionData.dishes);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Định dạng ID món ăn không hợp lệ');
  });

  it('should return 404 when dish does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const collectionData = {
      name: 'Món ăn Việt',
      dishes: JSON.stringify([nonExistentId])
    };

    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', collectionData.name)
      .field('dishes', collectionData.dishes);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Một hoặc nhiều món ăn không tồn tại');
  });

  // it('should handle malformed JSON gracefully', async () => {
  //   const collectionData = {
  //     name: 'Món ăn Việt',
  //     dishes: '{invalid json'
  //   };

  //   const res = await request(app)
  //     .post('/api/collections')
  //     .set('Authorization', `Bearer ${nutritionistToken}`)
  //     .field('name', collectionData.name)
  //     .field('dishes', collectionData.dishes);

  //   expect(res.status).toBe(400);
  // });

  // ============ ERROR CASES (500) ============
  it('should return 500 when image upload fails', async () => {
    // Mock upload to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    });

    const collectionData = {
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập món ăn giảm cân'
    };

    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', collectionData.name)
      .field('description', collectionData.description)
      .attach('image', Buffer.from('fake-image-data'), 'test-collection.jpg');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tải ảnh lên thất bại');
  });

  it('should return 500 when collection creation fails', async () => {
    // Mock CollectionModel.create to return null
    vi.spyOn(CollectionModel, 'create').mockResolvedValueOnce(null as any);

    const collectionData = {
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập món ăn giảm cân'
    };

    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('name', collectionData.name)
      .field('description', collectionData.description);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tạo bộ sưu tập thất bại');

    // Restore original function
    vi.spyOn(CollectionModel, 'create').mockRestore();
  });
});
