import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { CollectionModel, DishModel } from '~/shared/database/models';

describe('GET /api/collections/:id', () => {
  let collectionId: string;
  let userId: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
    userId = new mongoose.Types.ObjectId().toString();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});

    // Create test dish
    const dish = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Phở bò',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });

    // Create test collection
    const collection = await CollectionModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giúp giảm cân hiệu quả',
      isPublic: true,
      image: 'collection-image.jpg',
      dishes: [
        {
          dishId: dish._id,
          name: dish.name,
          calories: 250,
          image: 'dish-image.jpg',
          addedAt: new Date()
        }
      ],
      followers: 10,
      tags: ['giảm cân', 'healthy']
    });
    collectionId = collection._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should get collection detail successfully', async () => {
    const res = await request(app).get(`/api/collections/${collectionId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Lấy thông tin bộ sưu tập thành công');
    expect(res.body.data).toHaveProperty('_id', collectionId);
    expect(res.body.data).toHaveProperty('name', 'Món ăn giảm cân');
    expect(res.body.data).toHaveProperty('description', 'Bộ sưu tập các món ăn giúp giảm cân hiệu quả');
    expect(res.body.data).toHaveProperty('isPublic', true);
    expect(res.body.data).toHaveProperty('image', 'collection-image.jpg');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('_id', userId);
    expect(res.body.data.user).toHaveProperty('name', 'Test User');
    expect(res.body.data).toHaveProperty('dishes');
    expect(Array.isArray(res.body.data.dishes)).toBe(true);
    expect(res.body.data.dishes.length).toBe(1);
    expect(res.body.data.dishes[0]).toHaveProperty('name', 'Phở bò');
    expect(res.body.data.dishes[0]).toHaveProperty('calories', 250);
    expect(res.body.data.dishes[0]).toHaveProperty('addedAt');
    expect(res.body.data).toHaveProperty('followers', 10);
    expect(res.body.data).toHaveProperty('tags');
    expect(Array.isArray(res.body.data.tags)).toBe(true);
    expect(res.body.data.tags).toContain('giảm cân');
    expect(res.body.data.tags).toContain('healthy');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app).get('/api/collections/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Định dạng ID bộ sưu tập không hợp lệ');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/collections/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bộ sưu tập');
  });
});
