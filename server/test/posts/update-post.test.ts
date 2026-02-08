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
      secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/updated-post-0.jpg',
      public_id: 'updated-post-0',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions
import { deleteImage, uploadImage } from '~/shared/utils/cloudinary';

describe('PUT /api/posts/:id', () => {
  let nutritionistToken: string;
  let otherNutritionistToken: string;
  let adminToken: string;
  let nutritionistId: string;
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

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/updated-post-0.jpg',
        public_id: 'updated-post-0',
        format: 'jpg'
      } as any
    });
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

    // Create test post
    const post = await PostModel.create({
      author: {
        _id: nutritionistId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết gốc',
      content: 'Nội dung bài viết gốc...',
      slug: 'bai-viet-goc',
      category: POST_CATEGORY.NUTRITION,
      tags: ['nutrition'],
      isPublished: false
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
  it('should update post successfully without images', async () => {
    const updateData = {
      content: 'Nội dung đã được cập nhật...',
      category: POST_CATEGORY.LIFESTYLE,
      tags: JSON.stringify(['dinh dưỡng', 'healthy']),
      isPublished: 'true'
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('content', updateData.content)
      .field('category', updateData.category)
      .field('tags', updateData.tags)
      .field('isPublished', updateData.isPublished);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Cập nhật bài viết thành công');
    expect(res.body.data).toHaveProperty('content', 'Nội dung đã được cập nhật...');
    expect(res.body.data).toHaveProperty('category', POST_CATEGORY.LIFESTYLE);
    expect(res.body.data).toHaveProperty('isPublished', true);
    expect(res.body.data).toHaveProperty('publishedAt');
    expect(res.body.data.tags).toContain('dinh dưỡng');
    expect(res.body.data.tags).toContain('healthy');
  });

  it('should update post title and slug successfully', async () => {
    const updateData = {
      title: 'Tiêu đề mới hoàn toàn'
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('title', updateData.title);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('title', 'Tiêu đề mới hoàn toàn');
    expect(res.body.data).toHaveProperty('slug', 'tieu-de-moi-hoan-toan');
  });

  it('should update post with new images successfully', async () => {
    const updateData = {
      content: 'Nội dung với ảnh mới'
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('content', updateData.content)
      .attach('images', Buffer.from('new-image-data'), 'new-post-image.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('images');
    expect(Array.isArray(res.body.data.images)).toBe(true);
    expect(res.body.data.images.length).toBe(1);
  });

  it('should delete old images when updating with new images', async () => {
    // Create post with existing images
    const postWithImages = await PostModel.create({
      author: {
        _id: nutritionistId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết có ảnh cũ',
      content: 'Nội dung bài viết...',
      slug: 'bai-viet-co-anh-cu',
      images: [
        'https://res.cloudinary.com/test/old-image-0.jpg',
        'https://res.cloudinary.com/test/old-image-1.jpg'
      ],
      isPublished: false
    });

    const res = await request(app)
      .put(`/api/posts/${postWithImages._id}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('content', 'Nội dung mới')
      .attach('images', Buffer.from('new-image-data'), 'new-image.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    
    // Verify deleteImage was called for old images
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(`${postWithImages._id.toString()}-0`);
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(`${postWithImages._id.toString()}-1`);
  });

  it('should allow admin to update post', async () => {
    const updateData = {
      content: 'Admin cập nhật nội dung'
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('content', updateData.content);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('content', 'Admin cập nhật nội dung');
  });

  // ============ AUTHENTICATION & AUTHORIZATION ============
  it('should return 403 when updating post of another user', async () => {
    const updateData = {
      content: 'Nội dung không hợp lệ'
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherNutritionistToken}`)
      .field('content', updateData.content);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Bạn không có quyền cập nhật bài viết này');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when id format is invalid', async () => {
    const res = await request(app)
      .put('/api/posts/invalid-id')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('content', 'Nội dung mới');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'ID bài viết không hợp lệ');
  });

  it('should return 400 when updating to duplicate title', async () => {
    // Create another post
    await PostModel.create({
      author: {
        _id: nutritionistId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Tiêu đề đã tồn tại',
      content: 'Nội dung...',
      slug: 'tieu-de-da-ton-tai',
      isPublished: false
    });

    const updateData = {
      title: 'Tiêu đề đã tồn tại'
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('title', updateData.title);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Bài viết với tiêu đề này đã tồn tại');
  });

  // ============ NOT FOUND (404) ============
  it('should return 404 when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('content', 'Nội dung mới');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Không tìm thấy bài viết');
  });

  // ============ ERROR CASES (500) ============
  it('should return 500 when image upload fails', async () => {
    // Mock image upload failure
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    } as any);

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('content', 'Nội dung mới')
      .attach('images', Buffer.from('fake-image-data'), 'image.jpg');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tải ảnh lên thất bại');
  });
});
