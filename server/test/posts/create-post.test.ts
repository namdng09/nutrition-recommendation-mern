import mongoose from 'mongoose';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { PostService } from '~/features/posts/post-service';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models';

// Mock Cloudinary upload
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url:
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-post-0.jpg',
      public_id: 'test-post-0',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('PostService.createPost', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const userName = 'Test Nutritionist';
  const userAvatar = 'https://example.com/avatar.jpg';
  const userRole = ROLE.NUTRITIONIST;

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

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/test-post-0.jpg',
        public_id: 'test-post-0',
        format: 'jpg'
      } as any
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await PostModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should create post successfully', async () => {
    const postData = {
      title: 'Cách giảm cân hiệu quả',
      content: 'Nội dung chi tiết về giảm cân an toàn và hiệu quả...',
      category: POST_CATEGORY.NUTRITION,
      tags: ['giảm cân', 'dinh dưỡng'],
      isPublished: true
    };

    const post = await PostService.createPost(
      userId,
      userName,
      userAvatar,
      userRole,
      postData
    );

    expect(post).toBeDefined();
    expect(post.slug).toBe('cach-giam-can-hieu-qua');
    expect(post.isPublished).toBe(true);
    expect(post.publishedAt).toBeDefined();
    expect(post.author?._id.toString()).toBe(userId);
    expect(post.author?.name).toBe(userName);
    expect(post.tags).toContain('giảm cân');
    expect(post.tags).toContain('dinh dưỡng');
    expect(post.category).toBe(POST_CATEGORY.NUTRITION);
  });

  // Branch - Duplicate title
  it('should throw error when post with duplicate title exists', async () => {
    // Create first post
    await PostModel.create({
      author: {
        _id: userId,
        name: userName,
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

    await expect(
      PostService.createPost(userId, userName, userAvatar, userRole, postData)
    ).rejects.toThrow('Bài viết với tiêu đề này đã tồn tại');
  });

  // Branch - Missing required fields
  it('should throw error when required fields are missing', async () => {
    const postData = {
      title: undefined as unknown as string,
      content: 'content'
    };

    await expect(
      PostService.createPost(userId, userName, userAvatar, userRole, postData)
    ).rejects.toThrow('Tiêu đề không hợp lệ');
  });

  // Branch - Title too short
  it('should throw error when title is too short', async () => {
    const postData = {
      title: 'abc',
      content: 'Nội dung đủ dài'
    };

    await expect(
      PostService.createPost(userId, userName, userAvatar, userRole, postData)
    ).rejects.toThrow('Tiêu đề phải có ít nhất 5 ký tự');
  });

  // Branch - Invalid title type
  it('should throw error when title is not a string', async () => {
    const postData = {
      title: 123 as unknown as string,
      content: 'Nội dung đủ dài'
    };

    await expect(
      PostService.createPost(userId, userName, userAvatar, userRole, postData)
    ).rejects.toThrow('Tiêu đề không hợp lệ');
  });

  // Branch - Image upload failure
  it('should throw error when image upload fails', async () => {
    // Mock image upload failure
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      data: null
    } as any);

    const postData = {
      title: 'Bài viết test ảnh lỗi',
      content: 'Nội dung bài viết test'
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'post-image.jpg'
    } as Express.Multer.File;

    await expect(
      PostService.createPost(userId, userName, userAvatar, userRole, postData, [
        fakeImage
      ])
    ).rejects.toThrow('Tải ảnh lên thất bại');
  });
});
