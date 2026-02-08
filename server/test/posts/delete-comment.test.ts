import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, PostModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import { generateToken } from '~/shared/utils/jwt';

describe('DELETE /api/posts/:postId/comments/:commentId', () => {
  let userToken: string;
  let otherUserToken: string;
  let postAuthorToken: string;
  let adminToken: string;
  let userId: string;
  let postAuthorId: string;
  let postId: string;
  let commentId: string;

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

    const hashedPassword = await hashPassword('123456');

    // Create comment author (user)
    const user = await UserModel.create({
      email: 'user@test.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });
    userId = user._id.toString();

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

    // Create post author (nutritionist)
    const postAuthor = await UserModel.create({
      email: 'nutritionist@test.com',
      name: 'Test Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });
    postAuthorId = postAuthor._id.toString();

    await AuthModel.create({
      user: postAuthor._id,
      provider: 'local',
      providerId: 'nutritionist@test.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    const postAuthorTokens = generateToken({
      id: postAuthor._id.toString(),
      role: ROLE.NUTRITIONIST
    });
    postAuthorToken = postAuthorTokens.accessToken;

    // Create admin
    const admin = await UserModel.create({
      email: 'admin@test.com',
      name: 'Admin',
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

    // Create test post with comment
    const post = await PostModel.create({
      author: {
        _id: postAuthorId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết test',
      content: 'Nội dung bài viết test...',
      slug: 'bai-viet-test',
      isPublished: true,
      comments: [
        {
          author: {
            _id: userId,
            name: 'Test User',
            avatar: ''
          },
          content: 'Bình luận test',
          createdAt: new Date()
        }
      ]
    });
    postId = post._id.toString();
    commentId = (post.comments[0] as any)._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should delete comment as comment author successfully', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa bình luận thành công');

    // Verify comment is deleted
    const updatedPost = await PostModel.findById(postId);
    expect(updatedPost?.comments.length).toBe(0);
  });

  it('should delete comment as post author successfully', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${postAuthorToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa bình luận thành công');
  });

  it('should delete comment as admin successfully', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa bình luận thành công');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 403 when deleting comment of another user', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Bạn không có quyền xóa bình luận này');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when post id format is invalid', async () => {
    const res = await request(app)
      .delete(`/api/posts/invalid-id/comments/${commentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'ID bài viết không hợp lệ');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/posts/${nonExistentId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bài viết');
  });

  it('should return 404 when comment does not exist', async () => {
    const nonExistentCommentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${nonExistentCommentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bình luận');
  });
});
