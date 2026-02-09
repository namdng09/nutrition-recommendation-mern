import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models';

describe('GET /api/posts/:id', () => {
  let postId: string;
  let postWithoutViewsId: string;
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

    // Create test post with views
    const post = await PostModel.create({
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
    postId = post._id.toString();

    // Create post without views field to test undefined handling
    const postWithoutViews = await PostModel.create({
      author: {
        _id: userId,
        name: 'Test User',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết mới',
      content: 'Nội dung bài viết mới...',
      slug: 'bai-viet-moi',
      isPublished: true
      // No views field
    });
    postWithoutViewsId = postWithoutViews._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await PostModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should get post detail successfully and increment views', async () => {
    const res = await request(app).get(`/api/posts/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Lấy thông tin bài viết thành công');
    expect(res.body.data).toHaveProperty('_id', postId);
    expect(res.body.data).toHaveProperty('title', 'Cách giảm cân hiệu quả');
    expect(res.body.data).toHaveProperty('content');
    expect(res.body.data).toHaveProperty('slug', 'cach-giam-can-hieu-qua');
    expect(res.body.data).toHaveProperty('views', 11); // Incremented from 10 to 11
    expect(res.body.data).toHaveProperty('author');
    expect(res.body.data.author).toHaveProperty('_id', userId);
  });

  it('should handle post with undefined views correctly', async () => {
    const res = await request(app).get(`/api/posts/${postWithoutViewsId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('views', 1); // Should be 1 after increment from undefined
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app).get('/api/posts/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'ID bài viết không hợp lệ');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/posts/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bài viết');
  });
});
