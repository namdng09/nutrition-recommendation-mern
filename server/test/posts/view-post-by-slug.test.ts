import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models';

describe('GET /api/posts/slug/:slug', () => {
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
    await PostModel.deleteMany({});

    // Create published post
    await PostModel.create({
      author: {
        _id: userId,
        name: 'Test User',
        role: ROLE.NUTRITIONIST
      },
      title: 'Cách giảm cân hiệu quả',
      content: 'Nội dung chi tiết về giảm cân...',
      slug: 'cach-giam-can-hieu-qua',
      category: POST_CATEGORY.NUTRITION,
      tags: ['giảm cân'],
      isPublished: true,
      publishedAt: new Date(),
      views: 10
    });

    // Create unpublished post
    await PostModel.create({
      author: {
        _id: userId,
        name: 'Test User',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết chưa xuất bản',
      content: 'Nội dung bài viết chưa xuất bản...',
      slug: 'bai-viet-chua-xuat-ban',
      isPublished: false
    });

    // Create post without views to test undefined
    await PostModel.create({
      author: {
        _id: userId,
        name: 'Test User',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết mới nhất',
      content: 'Nội dung bài viết mới...',
      slug: 'bai-viet-moi-nhat',
      isPublished: true,
      publishedAt: new Date()
      // No views field
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await PostModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should get post by slug successfully and increment views', async () => {
    const res = await request(app).get('/api/posts/slug/cach-giam-can-hieu-qua');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Lấy thông tin bài viết thành công');
    expect(res.body.data).toHaveProperty('title', 'Cách giảm cân hiệu quả');
    expect(res.body.data).toHaveProperty('slug', 'cach-giam-can-hieu-qua');
    expect(res.body.data).toHaveProperty('views', 11); // Incremented from 10
    expect(res.body.data).toHaveProperty('isPublished', true);
  });

  it('should handle post with undefined views correctly', async () => {
    const res = await request(app).get('/api/posts/slug/bai-viet-moi-nhat');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('views', 1); // Should be 1 after increment
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when post does not exist', async () => {
    const res = await request(app).get('/api/posts/slug/nonexistent-slug');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bài viết');
  });

  it('should return 404 for unpublished post', async () => {
    const res = await request(app).get('/api/posts/slug/bai-viet-chua-xuat-ban');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bài viết');
  });
});
