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
import { AuthModel, DishModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

// Mock Cloudinary delete
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

describe('DELETE /api/dishes/:id', () => {
  let userToken: string;
  let otherUserToken: string;
  let adminToken: string;
  let userId: string;
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

    // Create admin
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
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should delete dish successfully by owner', async () => {
    const res = await request(app)
      .delete(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa món ăn thành công');

    // Verify dish is deleted from database
    const deletedDish = await DishModel.findById(dishId);
    expect(deletedDish).toBeNull();
  });

  it('should allow admin to delete any dish', async () => {
    const res = await request(app)
      .delete(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa món ăn thành công');

    // Verify dish is deleted from database
    const deletedDish = await DishModel.findById(dishId);
    expect(deletedDish).toBeNull();
  });

  it('should delete dish with image successfully', async () => {
    // Create dish with image
    const dishWithImage = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Bún chả',
      description: 'Bún chả Hà Nội',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Ướp thịt' }],
      image: 'https://example.com/image.jpg',
      isActive: true
    });

    const res = await request(app)
      .delete(`/api/dishes/${dishWithImage._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa món ăn thành công');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 401 when no token provided', async () => {
    const res = await request(app).delete(`/api/dishes/${dishId}`);

    expect(res.status).toBe(401);
  });

  it('should return 403 when user is not dish owner', async () => {
    const res = await request(app)
      .delete(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app)
      .delete('/api/dishes/invalid-id')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Định dạng ID món ăn không hợp lệ'
    );
  });

  it('should return 400 when id contains special characters', async () => {
    const res = await request(app)
      .delete('/api/dishes/123!@#$%^&*()')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Định dạng ID món ăn không hợp lệ'
    );
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when dish does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/dishes/${nonExistentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy món ăn');
  });

  // ============ ERROR CASES (500) ============
  it('should return 404 when findByIdAndDelete returns null', async () => {
    // Mock findByIdAndDelete to return null
    vi.spyOn(DishModel, 'findByIdAndDelete').mockResolvedValueOnce(null);

    const res = await request(app)
      .delete(`/api/dishes/${dishId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy món ăn');

    // Restore original function
    vi.spyOn(DishModel, 'findByIdAndDelete').mockRestore();
  });
});
