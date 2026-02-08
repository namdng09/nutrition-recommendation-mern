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

// Mock Cloudinary upload
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test-post-0.jpg',
      public_id: 'test-post-0',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import { uploadImage } from '~/shared/utils/cloudinary';

describe('POST /api/posts', () => {
  let nutritionistToken: string;
  let nutritionistId: string;
  let nutritionistName: string;

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
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test-post-0.jpg',
        public_id: 'test-post-0',
        format: 'jpg'
      } as any
    });

    // Create nutritionist
    const nutritionist = await UserModel.create({
      email: 'nutritionist@test.com',
      name: 'Test Nutritionist',
      role: ROLE.NUTRITIONIST,
      isActive: true
    });
    nutritionistId = nutritionist._id.toString();
    nutritionistName = nutritionist.name;

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
  });

  afterAll(async () => {
    // Clean up and close connection
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await AuthModel.deleteMany({});
    await mongoose.connection.close();
  });

  // ============ HAPPY CASES ============
  it('should create post successfully without images', async () => {
    const postData = {
      title: 'Cách giảm cân hiệu quả',
      content: 'Nội dung chi tiết về giảm cân an toàn và hiệu quả...',
      category: POST_CATEGORY.NUTRITION,
      tags: JSON.stringify(['giảm cân', 'dinh dưỡng']),
      isPublished: 'true'
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('title', postData.title)
      .field('content', postData.content)
      .field('category', postData.category)
      .field('tags', postData.tags)
      .field('isPublished', postData.isPublished);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Tạo bài viết thành công');
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('title', 'Cách giảm cân hiệu quả');
    expect(res.body.data).toHaveProperty('content', 'Nội dung chi tiết về giảm cân an toàn và hiệu quả...');
    expect(res.body.data).toHaveProperty('slug', 'cach-giam-can-hieu-qua');
    expect(res.body.data).toHaveProperty('isPublished', true);
    expect(res.body.data).toHaveProperty('publishedAt');
    expect(res.body.data).toHaveProperty('author');
    expect(res.body.data.author).toHaveProperty('_id', nutritionistId);
    expect(res.body.data.author).toHaveProperty('name', nutritionistName);
    expect(res.body.data.tags).toContain('giảm cân');
    expect(res.body.data.tags).toContain('dinh dưỡng');
  });

  it('should create post successfully with images', async () => {
    const postData = {
      title: 'Top 10 món ăn healthy',
      content: 'Danh sách các món ăn tốt cho sức khỏe...'
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('title', postData.title)
      .field('content', postData.content)
      .attach('images', Buffer.from('fake-image-data'), 'post-image.jpg');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('title', 'Top 10 món ăn healthy');
    expect(res.body.data).toHaveProperty('images');
    expect(Array.isArray(res.body.data.images)).toBe(true);
    expect(res.body.data.images.length).toBe(1);
    expect(res.body.data.images[0]).toBe('https://res.cloudinary.com/test/image/upload/v1234567890/test-post-0.jpg');
  });

  // ============ VALIDATION (400) ============
  it('should return 400 when post with duplicate title exists', async () => {
    // Create first post
    await PostModel.create({
      author: {
        _id: nutritionistId,
        name: nutritionistName,
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết test',
      content: 'Nội dung bài viết test',
      slug: 'bai-viet-test',
      isPublished: false
    });

    const postData = {
      title: 'Bài viết test',
      content: 'Nội dung khác nhưng cùng tiêu đề'
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('title', postData.title)
      .field('content', postData.content);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Bài viết với tiêu đề này đã tồn tại');
  });

  // ============ ERROR CASES (500) ============
  it('should return 500 when image upload fails', async () => {
    // Mock image upload failure
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    } as any);

    const postData = {
      title: 'Bài viết test ảnh lỗi',
      content: 'Nội dung bài viết test'
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('title', postData.title)
      .field('content', postData.content)
      .attach('images', Buffer.from('fake-image-data'), 'post-image.jpg');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tải ảnh lên thất bại');
  });

  it('should return 500 when post creation fails', async () => {
    // Mock PostModel.create to return null
    const originalCreate = PostModel.create;
    PostModel.create = vi.fn().mockResolvedValueOnce(null);

    const postData = {
      title: 'Bài viết test lỗi',
      content: 'Nội dung bài viết test'
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${nutritionistToken}`)
      .field('title', postData.title)
      .field('content', postData.content);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Tạo bài viết thất bại');

    // Restore original create
    PostModel.create = originalCreate;
  });
});
