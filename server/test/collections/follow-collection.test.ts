import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, CollectionModel, DishModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

describe('POST /api/collections/:id/follow', () => {
  let userToken: string;
  let userId: string;
  let collectionId: string;
  let privateCollectionId: string;

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

    // Create nutritionist for collections
    const nutritionist = await UserModel.create({
      email: 'nutritionist@test.com',
      name: 'Test Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });
    const nutritionistId = nutritionist._id.toString();

    // Create public collection
    const collection = await CollectionModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giảm cân',
      isPublic: true,
      dishes: [],
      followers: 5
    });
    collectionId = collection._id.toString();

    // Create private collection
    const privateCollection = await CollectionModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Món ăn riêng tư',
      description: 'Bộ sưu tập riêng tư',
      isPublic: false,
      dishes: [],
      followers: 0
    });
    privateCollectionId = privateCollection._id.toString();
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
  it('should follow collection successfully', async () => {
    const res = await request(app)
      .post(`/api/collections/${collectionId}/follow`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Theo dõi bộ sưu tập thành công');
    expect(res.body.data).toHaveProperty('followers', 6);
  });

  it('should handle collection with undefined followers count', async () => {
    // Create collection without followers field
    const collectionWithoutFollowers = await CollectionModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'New collection',
      description: 'Collection without followers field',
      isPublic: true,
      dishes: []
      // No followers field
    });

    const res = await request(app)
      .post(`/api/collections/${collectionWithoutFollowers._id}/follow`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('followers', 1);
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app)
      .post('/api/collections/invalid-id/follow')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Định dạng ID bộ sưu tập không hợp lệ');
  });

  // ============ FORBIDDEN (403) ============
  it('should return 403 when trying to follow private collection', async () => {
    const res = await request(app)
      .post(`/api/collections/${privateCollectionId}/follow`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không thể theo dõi bộ sưu tập riêng tư');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/collections/${nonExistentId}/follow`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bộ sưu tập');
  });
});
