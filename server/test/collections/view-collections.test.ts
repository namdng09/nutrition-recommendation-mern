import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { ROLE } from '~/shared/constants/role';
import { CollectionModel, DishModel } from '~/shared/database/models';

describe('GET /api/collections', () => {
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
    userId1 = new mongoose.Types.ObjectId().toString();
    userId2 = new mongoose.Types.ObjectId().toString();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});

    // Create test dishes
    const dish1 = await DishModel.create({
      user: { _id: userId1, name: 'User 1' },
      name: 'Phở bò',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });

    const dish2 = await DishModel.create({
      user: { _id: userId1, name: 'User 1' },
      name: 'Bún chả',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Ướp thịt' }],
      isActive: true
    });

    // Create test collections
    await CollectionModel.create({
      user: { _id: userId1, name: 'User 1' },
      name: 'Món ăn giảm cân',
      description: 'Các món ăn giúp giảm cân',
      isPublic: true,
      dishes: [
        {
          dishId: dish1._id,
          name: dish1.name,
          calories: 250,
          addedAt: new Date()
        }
      ],
      followers: 10,
      tags: ['giảm cân', 'healthy']
    });

    await CollectionModel.create({
      user: { _id: userId1, name: 'User 1' },
      name: 'Món ăn tăng cơ',
      description: 'Các món ăn cho người tập gym',
      isPublic: false,
      dishes: [
        {
          dishId: dish2._id,
          name: dish2.name,
          calories: 300,
          addedAt: new Date()
        }
      ],
      followers: 5,
      tags: ['tăng cơ', 'gym']
    });

    await CollectionModel.create({
      user: { _id: userId2, name: 'User 2' },
      name: 'Món ăn Việt',
      description: 'Các món ăn truyền thống Việt Nam',
      isPublic: true,
      dishes: [],
      followers: 20,
      tags: ['việt nam', 'truyền thống']
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should get all collections successfully', async () => {
    const res = await request(app).get('/api/collections');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Lấy danh sách bộ sưu tập thành công');
    expect(res.body.data).toHaveProperty('docs');
    expect(Array.isArray(res.body.data.docs)).toBe(true);
    expect(res.body.data.docs.length).toBe(3);
    expect(res.body.data).toHaveProperty('totalDocs', 3);
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('totalPages');
  });

  it('should filter collections by isPublic', async () => {
    const res = await request(app).get('/api/collections?filter[isPublic]=true');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data.docs.length).toBe(2);
    res.body.data.docs.forEach((collection: any) => {
      expect(collection.isPublic).toBe(true);
    });
  });

  it('should paginate collections correctly', async () => {
    const res = await request(app).get('/api/collections?filter[tags]=giảm cân');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data.docs.length).toBeGreaterThanOrEqual(1);
  });

  it('should paginate collections correctly', async () => {
    const res = await request(app).get('/api/collections?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data.docs.length).toBe(2);
    expect(res.body.data).toHaveProperty('page', 1);
    expect(res.body.data).toHaveProperty('totalPages', 2);
  });

  it('should return empty array when no collections match filter', async () => {
    const res = await request(app).get('/api/collections?filter[tags]=nonexistent');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data.docs).toHaveLength(0);
  });
});
