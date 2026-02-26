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
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models';

// Mock Cloudinary
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url:
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-post.jpg',
      public_id: 'test-post',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('PostService.deletePost', () => {
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
    vi.mocked(cloudinaryUtils.deleteImage).mockResolvedValue({ success: true });

    // Create test posts
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

  afterEach(async () => {
    // Clean up after each test
    await PostModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should delete post successfully', async () => {
    await PostService.deletePost(
      postWithImagesId,
      nutritionistId,
      ROLE.NUTRITIONIST
    );

    // Verify deleteImage was called for each image
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(
      `${postWithImagesId}-0`
    );
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(
      `${postWithImagesId}-1`
    );

    // Verify post is deleted
    const deletedPost = await PostModel.findById(postWithImagesId);
    expect(deletedPost).toBeNull();
  });

  it('should allow admin to delete post', async () => {
    await PostService.deletePost(postId, adminId, ROLE.ADMIN);

    // Verify post is deleted
    const deletedPost = await PostModel.findById(postId);
    expect(deletedPost).toBeNull();
  });

  // Branch - Unauthorized user
  it('should throw error when deleting post of another user', async () => {
    await expect(
      PostService.deletePost(postId, otherNutritionistId, ROLE.NUTRITIONIST)
    ).rejects.toThrow('Bạn không có quyền xóa bài viết này');
  });

  // Branch - Invalid ID
  it('should throw error when id format is invalid', async () => {
    await expect(
      PostService.deletePost('invalid-id', nutritionistId, ROLE.NUTRITIONIST)
    ).rejects.toThrow('ID bài viết không hợp lệ');
  });

  // Branch - Post not found
  it('should throw error when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      PostService.deletePost(nonExistentId, nutritionistId, ROLE.NUTRITIONIST)
    ).rejects.toThrow('Không tìm thấy bài viết');
  });
});
