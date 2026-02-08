import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { ROLE } from '~/shared/constants/role';
import { UNIT } from '~/shared/constants/unit';
import { AuthModel, CollectionModel, DishModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

describe('POST /api/collections/:id/dishes', () => {
  let nutritionistToken: string;
  let otherNutritionistToken: string;
  let userToken: string;
  let nutritionistId: string;
  let collectionId: string;
  let dishId1: string;
  let dishId2: string;

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

    // Create test dishes
    const dish1 = await DishModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
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
      isActive: true,
      image: 'pho-bo.jpg'
    });
    dishId1 = dish1._id.toString();

    const dish2 = await DishModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Bún chả',
      description: 'Bún chả Hà Nội',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: 'Thịt lợn',
          nutrients: {
            calories: { value: 300, unit: UNIT.KILOCALORIE },
            carbs: { value: 0, unit: UNIT.GRAM },
            fat: { value: 20, unit: UNIT.GRAM },
            protein: { value: 24, unit: UNIT.GRAM },
            fiber: { value: 0, unit: UNIT.GRAM },
            sodium: { value: 60, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 80, unit: UNIT.MILLIGRAM }
          },
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 150, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Ướp thịt' }],
      isActive: true,
      image: 'bun-cha.jpg'
    });
    dishId2 = dish2._id.toString();

    // Create test collection
    const collection = await CollectionModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giảm cân',
      isPublic: false,
      dishes: []
    });
    collectionId = collection._id.toString();
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
  it('should add single dish to collection successfully', async () => {
    const res = await request(app)
      .post(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Thêm món ăn vào bộ sưu tập thành công');
    expect(res.body.data.dishes).toHaveLength(1);
    expect(res.body.data.dishes[0]).toHaveProperty('dishId', dishId1);
    expect(res.body.data.dishes[0]).toHaveProperty('name', 'Phở bò');
    expect(res.body.data.dishes[0]).toHaveProperty('calories', 250);
    expect(res.body.data.dishes[0]).toHaveProperty('image', 'pho-bo.jpg');
    expect(res.body.data.dishes[0]).toHaveProperty('addedAt');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 403 when adding to collection of another nutritionist', async () => {
    const res = await request(app)
      .post(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${otherNutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Bạn không có quyền sửa bộ sưu tập này');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when collection id format is invalid', async () => {
    const res = await request(app)
      .post('/api/collections/invalid-id/dishes')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Định dạng ID bộ sưu tập không hợp lệ');
  });

  it('should return 400 when dish id format is invalid', async () => {
    const res = await request(app)
      .post(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: ['invalid-id'] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Định dạng ID món ăn không hợp lệ');
  });

  it('should return 400 when trying to add duplicate dish', async () => {
    // First add dish to collection
    await request(app)
      .post(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    // Try to add same dish again
    const res = await request(app)
      .post(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('đã tồn tại trong bộ sưu tập');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/collections/${nonExistentId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bộ sưu tập');
  });

  it('should return 404 when dish does not exist', async () => {
    const nonExistentDishId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [nonExistentDishId] });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Một hoặc nhiều món ăn không tồn tại');
  });

  it('should return 404 when some dishes do not exist', async () => {
    const nonExistentDishId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1, nonExistentDishId] });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Một hoặc nhiều món ăn không tồn tại');
  });

  it('should handle dish without nutrients correctly', async () => {
    // Create dish without nutrients
    const dishWithoutNutrients = await DishModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Món ăn không có thông tin dinh dưỡng',
      description: 'Món ăn thiếu thông tin',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: 'Nguyên liệu không có calories',
          // No nutrients field
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 100, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Chế biến' }],
      isActive: true
    });

    const res = await request(app)
      .post(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishWithoutNutrients._id.toString()] });

    expect(res.status).toBe(200);
    expect(res.body.data.dishes[0]).toHaveProperty('calories', 0);
  });
});
