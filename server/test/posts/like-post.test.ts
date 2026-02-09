import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, PostModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

describe('POST /api/posts/:id/like', () => {
  let userToken: string;
  let userId: string;
  let postId: string;
  let postWithLikesId: string;

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

    // Create post without likes
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
      likes: []
    });
    postId = post._id.toString();

    // Create another user who already liked
    const otherUser = await UserModel.create({
      email: 'other@test.com',
      name: 'Other User',
      role: ROLE.USER,
      isActive: true
    });
    const otherUserId = otherUser._id;

    // Create post with existing likes
    const postWithLikes = await PostModel.create({
      author: {
        _id: nutritionistId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết có likes',
      content: 'Nội dung...',
      slug: 'bai-viet-co-likes',
      isPublished: true,
      likes: [userId, otherUserId]
    });
    postWithLikesId = postWithLikes._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should like post successfully', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Đã thích bài viết');
    expect(res.body.data).toHaveProperty('liked', true);
    expect(res.body.data).toHaveProperty('likesCount', 1);
  });

  it('should unlike post successfully', async () => {
    const res = await request(app)
      .post(`/api/posts/${postWithLikesId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Đã bỏ thích bài viết');
    expect(res.body.data).toHaveProperty('liked', false);
    expect(res.body.data).toHaveProperty('likesCount', 1); // Should be 1 after removing user's like
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app)
      .post('/api/posts/invalid-id/like')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'ID bài viết không hợp lệ');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/posts/${nonExistentId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bài viết');
  });
});
