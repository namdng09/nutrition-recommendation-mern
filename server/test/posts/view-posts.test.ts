import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models';

describe('GET /api/posts', () => {
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
    await PostModel.deleteMany({});

    // Create test posts
    await PostModel.create({
      author: {
        _id: userId1,
        name: 'User 1',
        role: ROLE.NUTRITIONIST
      },
      title: 'Cách giảm cân hiệu quả',
      content: 'Nội dung chi tiết về giảm cân...',
      slug: 'cach-giam-can-hieu-qua',
      category: POST_CATEGORY.NUTRITION,
      tags: ['giảm cân', 'dinh dưỡng'],
      isPublished: true,
      publishedAt: new Date(),
      views: 100
    });

    await PostModel.create({
      author: {
        _id: userId1,
        name: 'User 1',
        role: ROLE.NUTRITIONIST
      },
      title: 'Top 10 món ăn healthy',
      content: 'Danh sách các món ăn tốt cho sức khỏe...',
      slug: 'top-10-mon-an-healthy',
      category: POST_CATEGORY.RECIPE,
      tags: ['healthy', 'công thức'],
      isPublished: false,
      views: 50
    });

    await PostModel.create({
      author: {
        _id: userId2,
        name: 'User 2',
        role: ROLE.ADMIN
      },
      title: 'Lối sống khỏe mạnh',
      content: 'Hướng dẫn lối sống khỏe mạnh...',
      slug: 'loi-song-khoe-manh',
      category: POST_CATEGORY.LIFESTYLE,
      tags: ['lối sống'],
      isPublished: true,
      publishedAt: new Date(),
      views: 200
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await PostModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should get all posts successfully', async () => {
    const res = await request(app).get('/api/posts');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Lấy danh sách bài viết thành công');
    expect(res.body.data).toHaveProperty('docs');
    expect(Array.isArray(res.body.data.docs)).toBe(true);
    expect(res.body.data.docs.length).toBe(3);
    expect(res.body.data).toHaveProperty('totalDocs', 3);
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('totalPages');
  });

  it('should filter posts by isPublished', async () => {
    const res = await request(app).get('/api/posts?filter[isPublished]=true');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data.docs.length).toBe(2);
    res.body.data.docs.forEach((post: any) => {
      expect(post.isPublished).toBe(true);
    });
  });

  it('should paginate posts correctly', async () => {
    const res = await request(app).get('/api/posts?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data.docs.length).toBe(2);
    expect(res.body.data).toHaveProperty('page', 1);
    expect(res.body.data).toHaveProperty('totalPages', 2);
  });

  it('should return empty array when no posts match filter', async () => {
    const res = await request(app).get('/api/posts?filter[tags]=nonexistent');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data.docs).toHaveLength(0);
  });
});
