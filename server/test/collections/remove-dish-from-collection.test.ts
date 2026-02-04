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

describe('DELETE /api/collections/:id/dishes', () => {
  let nutritionistToken: string;
  let otherNutritionistToken: string;
  let userToken: string;
  let nutritionistId: string;
  let collectionId: string;
  let dishId1: string;
  let dishId2: string;
  let dishId3: string;

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
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });
    dishId1 = dish1._id.toString();

    const dish2 = await DishModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Bún chả',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Ướp thịt' }],
      isActive: true
    });
    dishId2 = dish2._id.toString();

    const dish3 = await DishModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Cơm tấm',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Nướng thịt' }],
      isActive: true
    });
    dishId3 = dish3._id.toString();

    // Create test collection with dishes
    const collection = await CollectionModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Món ăn Việt',
      description: 'Bộ sưu tập các món ăn Việt Nam',
      isPublic: false,
      dishes: [
        {
          dishId: dish1._id,
          name: dish1.name,
          calories: 250,
          image: 'pho-bo.jpg',
          addedAt: new Date()
        },
        {
          dishId: dish2._id,
          name: dish2.name,
          calories: 300,
          image: 'bun-cha.jpg',
          addedAt: new Date()
        },
        {
          dishId: dish3._id,
          name: dish3.name,
          calories: 400,
          image: 'com-tam.jpg',
          addedAt: new Date()
        }
      ]
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
  it('should remove single dish from collection successfully', async () => {
    const res = await request(app)
      .delete(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa món ăn khỏi bộ sưu tập thành công');
    expect(res.body.data.dishes).toHaveLength(2);
    expect(res.body.data.dishes.find((d: any) => d.dishId.toString() === dishId1)).toBeUndefined();
    expect(res.body.data.dishes.find((d: any) => d.dishId.toString() === dishId2)).toBeDefined();
    expect(res.body.data.dishes.find((d: any) => d.dishId.toString() === dishId3)).toBeDefined();
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 403 when removing from collection of another nutritionist', async () => {
    const res = await request(app)
      .delete(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${otherNutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Bạn không có quyền sửa bộ sưu tập này');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when collection id format is invalid', async () => {
    const res = await request(app)
      .delete('/api/collections/invalid-id/dishes')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Định dạng ID bộ sưu tập không hợp lệ');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/collections/${nonExistentId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bộ sưu tập');
  });

  it('should return 404 when dish is not in collection', async () => {
    const nonExistentDishId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [nonExistentDishId] });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Không tìm thấy món ăn nào trong bộ sưu tập');
  });

  it('should return 404 when all dishes are not in collection', async () => {
    const nonExistentDishId1 = new mongoose.Types.ObjectId().toString();
    const nonExistentDishId2 = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/collections/${collectionId}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [nonExistentDishId1, nonExistentDishId2] });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Không tìm thấy món ăn nào trong bộ sưu tập');
  });

  it('should handle collection with undefined dishId in dishes array', async () => {
    // Create collection with a dish that has undefined dishId
    const collectionWithBadDish = await CollectionModel.create({
      user: { _id: nutritionistId, name: 'Test Nutritionist' },
      name: 'Collection with bad data',
      description: 'Testing edge case',
      isPublic: false,
      dishes: [
        {
          dishId: undefined as any,
          name: 'Bad dish',
          calories: 0,
          addedAt: new Date()
        },
        {
          dishId: dishId1,
          name: 'Good dish',
          calories: 250,
          addedAt: new Date()
        }
      ]
    });

    const res = await request(app)
      .delete(`/api/collections/${collectionWithBadDish._id}/dishes`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .send({ dishIds: [dishId1] });

    expect(res.status).toBe(200);
    expect(res.body.data.dishes).toHaveLength(1);
    expect(res.body.data.dishes[0].name).toBe('Bad dish');
  });
});
