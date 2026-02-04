import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, PostModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

describe('POST /api/posts/:id/comments', () => {
  let userToken: string;
  let userId: string;
  let userName: string;
  let postId: string;

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
    await PostModel.deleteMany({});
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
    userName = user.name;

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

    // Create nutritionist for posts
    const nutritionist = await UserModel.create({
      email: 'nutritionist@test.com',
      name: 'Test Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });
    const nutritionistId = nutritionist._id.toString();

    // Create test post
    const post = await PostModel.create({
      author: {
        _id: nutritionistId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết test',
      content: 'Nội dung bài viết test...',
      slug: 'bai-viet-test',
      isPublished: true,
      comments: []
    });
    postId = post._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should add comment successfully', async () => {
    const commentData = {
      content: 'Bài viết rất hay và bổ ích!'
    };

    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(commentData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Thêm bình luận thành công');
    expect(res.body.data).toHaveProperty('content', 'Bài viết rất hay và bổ ích!');
    expect(res.body.data).toHaveProperty('author');
    expect(res.body.data.author).toHaveProperty('_id', userId);
    expect(res.body.data.author).toHaveProperty('name', userName);
    expect(res.body.data).toHaveProperty('createdAt');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const commentData = {
      content: 'Bình luận test'
    };

    const res = await request(app)
      .post('/api/posts/invalid-id/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send(commentData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'ID bài viết không hợp lệ');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const commentData = {
      content: 'Bình luận test'
    };

    const res = await request(app)
      .post(`/api/posts/${nonExistentId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(commentData);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bài viết');
  });
});
