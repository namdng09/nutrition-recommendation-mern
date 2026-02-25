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

// Mock Cloudinary
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url:
        'https://res.cloudinary.com/test/image/upload/v1234567890/updated-post-0.jpg',
      public_id: 'updated-post-0',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('PostService.updatePost', () => {
  const nutritionistId = new mongoose.Types.ObjectId().toString();
  const otherNutritionistId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();
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

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/updated-post-0.jpg',
        public_id: 'updated-post-0',
        format: 'jpg'
      } as any
    });
    vi.mocked(cloudinaryUtils.deleteImage).mockResolvedValue({ success: true });

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

    const postWithImages = await PostModel.create({
      author: {
        _id: nutritionistId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết có ảnh cũ',
      content: 'Nội dung bài viết...',
      slug: 'bai-viet-co-anh',
      images: [
        'https://res.cloudinary.com/test/old-image-0.jpg',
        'https://res.cloudinary.com/test/old-image-1.jpg'
      ],
      isPublished: false
    });
    postWithImagesId = postWithImages._id.toString();
  });

  afterEach(async () => {
    // Clean up after each test
    await PostModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  it('should update post successfully', async () => {
    const updateData = {
      title: 'Tiêu đề mới',
      content: 'Nội dung mới',
      category: POST_CATEGORY.LIFESTYLE,
      tags: ['dinh dưỡng', 'healthy'],
      isPublished: true
    };

    const fakeImage = {
      buffer: Buffer.from('new-image-data'),
      originalname: 'new-post-image.jpg'
    } as Express.Multer.File;

    const updatedPost = await PostService.updatePost(
      postWithImagesId,
      nutritionistId,
      ROLE.NUTRITIONIST,
      updateData,
      [fakeImage]
    );

    expect(updatedPost).toBeDefined();
    expect(updatedPost.images).toBeDefined();
    expect(Array.isArray(updatedPost.images)).toBe(true);
    expect(updatedPost.images!.length).toBe(1);

    // Verify deleteImage was called for old images
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(
      `${postWithImagesId}-0`
    );
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(
      `${postWithImagesId}-1`
    );
  });

  it('should allow admin to update post', async () => {
    const updateData = {
      content: 'Admin cập nhật nội dung'
    };

    const updatedPost = await PostService.updatePost(
      postId,
      adminId,
      ROLE.ADMIN,
      updateData
    );

    expect(updatedPost).toBeDefined();
    expect(updatedPost.content).toBe('Admin cập nhật nội dung');
  });

  // Branch - Unauthorized user
  it('should throw error when updating post of another user', async () => {
    const updateData = {
      content: 'Nội dung không hợp lệ'
    };

    await expect(
      PostService.updatePost(
        postId,
        otherNutritionistId,
        ROLE.NUTRITIONIST,
        updateData
      )
    ).rejects.toThrow('Bạn không có quyền cập nhật bài viết này');
  });

  // Branch - Invalid ID
  it('should throw error when id format is invalid', async () => {
    await expect(
      PostService.updatePost('invalid-id', nutritionistId, ROLE.NUTRITIONIST, {
        content: 'Nội dung mới'
      })
    ).rejects.toThrow('ID bài viết không hợp lệ');
  });

  // Branch - Duplicate title
  it('should throw error when updating to duplicate title', async () => {
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

    await expect(
      PostService.updatePost(
        postId,
        nutritionistId,
        ROLE.NUTRITIONIST,
        updateData
      )
    ).rejects.toThrow('Bài viết với tiêu đề này đã tồn tại');
  });

  // Branch - Post not found
  it('should throw error when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      PostService.updatePost(nonExistentId, nutritionistId, ROLE.NUTRITIONIST, {
        content: 'Nội dung mới'
      })
    ).rejects.toThrow('Không tìm thấy bài viết');
  });

  // Branch - Image upload failure
  it('should throw error when image upload fails', async () => {
    // Mock image upload failure
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      data: null
    } as any);

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'image.jpg'
    } as Express.Multer.File;

    await expect(
      PostService.updatePost(
        postId,
        nutritionistId,
        ROLE.NUTRITIONIST,
        { content: 'Nội dung mới' },
        [fakeImage]
      )
    ).rejects.toThrow('Tải ảnh lên thất bại');
  });
});
