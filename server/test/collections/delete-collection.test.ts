import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '~/app';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, CollectionModel, DishModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

// Mock Cloudinary
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

describe('DELETE /api/collections/:id', () => {
  let nutritionistToken: string;
  let otherNutritionistToken: string;
  let userToken: string;
  let nutritionistId: string;
  let collectionId: string;
  let collectionWithImageId: string;

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
    vi.mocked(cloudinaryUtils.deleteImage).mockResolvedValue({ success: true });

    // Create nutritionist
    const nutritionist = await UserModel.create({
      email: 'nutritionist@test.com',
      name: 'Test Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });
    nutritionistId = nutritionist._id.toString();

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

    // Create another nutritionist
    const otherNutritionist = await UserModel.create({
      email: 'other@test.com',
      name: 'Other Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });

    await AuthModel.create({
      user: otherNutritionist._id,
      provider: 'local',
      providerId: 'other@test.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    const otherNutritionistTokens = generateToken({
      id: otherNutritionist._id.toString(),
      role: ROLE.NUTRITIONIST
    });
    otherNutritionistToken = otherNutritionistTokens.accessToken;

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

    // Create test collection without image
    const collection = await CollectionModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giảm cân',
      isPublic: false,
      dishes: []
    });
    collectionId = collection._id.toString();

    // Create test collection with image
    const collectionWithImage = await CollectionModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Món ăn tăng cơ',
      description: 'Bộ sưu tập các món ăn tăng cơ',
      isPublic: false,
      image: 'https://res.cloudinary.com/test/image/upload/v1234567890/test-collection.jpg',
      dishes: []
    });
    collectionWithImageId = collectionWithImage._id.toString();
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
  it('should delete collection successfully without image', async () => {
    const res = await request(app)
      .delete(`/api/collections/${collectionId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa bộ sưu tập thành công');

    // Verify collection is deleted
    const deletedCollection = await CollectionModel.findById(collectionId);
    expect(deletedCollection).toBeNull();
  });

  it('should delete collection successfully with image', async () => {
    const res = await request(app)
      .delete(`/api/collections/${collectionWithImageId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa bộ sưu tập thành công');

    // Verify deleteImage was called
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(collectionWithImageId);

    // Verify collection is deleted
    const deletedCollection = await CollectionModel.findById(collectionWithImageId);
    expect(deletedCollection).toBeNull();
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 403 when deleting collection of another nutritionist', async () => {
    const res = await request(app)
      .delete(`/api/collections/${collectionId}`)
      .set('Authorization', `Bearer ${otherNutritionistToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Bạn không có quyền xóa bộ sưu tập này');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app)
      .delete('/api/collections/invalid-id')
      .set('Authorization', `Bearer ${nutritionistToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Định dạng ID bộ sưu tập không hợp lệ');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/collections/${nonExistentId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bộ sưu tập');
  });
});
