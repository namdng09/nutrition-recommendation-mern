import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '~/app';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, PostModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';
import * as cloudinaryUtils from '~/shared/utils/cloudinary';
import { generateToken } from '~/shared/utils/jwt';

// Mock Cloudinary
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test-post.jpg',
      public_id: 'test-post',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions
import { deleteImage } from '~/shared/utils/cloudinary';

describe('DELETE /api/posts/:id', () => {
  let nutritionistToken: string;
  let otherNutritionistToken: string;
  let adminToken: string;
  let nutritionistId: string;
  let postId: string;
  let postWithImagesId: string;

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

    // Reset mocks
    vi.mocked(cloudinaryUtils.deleteImage).mockResolvedValue({ success: true });

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

    // Create test post without images
    const post = await PostModel.create({
      author: {
        _id: nutritionistId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết test',
      content: 'Nội dung bài viết test...',
      slug: 'bai-viet-test',
      isPublished: false
    });
    postId = post._id.toString();

    // Create test post with images
    const postWithImages = await PostModel.create({
      author: {
        _id: nutritionistId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết có ảnh',
      content: 'Nội dung bài viết có ảnh...',
      slug: 'bai-viet-co-anh',
      images: [
        'https://res.cloudinary.com/test/image/upload/v1234567890/post-0.jpg',
        'https://res.cloudinary.com/test/image/upload/v1234567890/post-1.jpg'
      ],
      isPublished: false
    });
    postWithImagesId = postWithImages._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should delete post successfully without images', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa bài viết thành công');

    // Verify post is deleted
    const deletedPost = await PostModel.findById(postId);
    expect(deletedPost).toBeNull();
  });

  it('should delete post successfully with images', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postWithImagesId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa bài viết thành công');

    // Verify deleteImage was called for each image
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(`${postWithImagesId}-0`);
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(`${postWithImagesId}-1`);

    // Verify post is deleted
    const deletedPost = await PostModel.findById(postWithImagesId);
    expect(deletedPost).toBeNull();
  });

  it('should allow admin to delete post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Xóa bài viết thành công');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 403 when deleting post of another user', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherNutritionistToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Bạn không có quyền xóa bài viết này');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app)
      .delete('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${nutritionistToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'ID bài viết không hợp lệ');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bài viết');
  });
});
