import mongoose from 'mongoose';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { PostService } from '~/features/posts/post-service';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models';

describe('PostService.viewPostDetail', () => {
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

    // Create test post
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
  it('should get post detail successfully and increment views', async () => {
    const post = await PostService.viewPostDetail(postId);

    expect(post).toBeDefined();
    expect(post._id.toString()).toBe(postId);
    expect(post.title).toBe('Cách giảm cân hiệu quả');
    expect(post.content).toBeDefined();
    expect(post.slug).toBe('cach-giam-can-hieu-qua');
    expect(post.views).toBe(11);
    expect(post.author?._id.toString()).toBe(userId);
  });

  // Branch - Invalid ID
  it('should throw error when id format is invalid', async () => {
    await expect(PostService.viewPostDetail('invalid-id')).rejects.toThrow(
      'ID bài viết không hợp lệ'
    );
  });

  // Branch - Post not found
  it('should throw error when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(PostService.viewPostDetail(nonExistentId)).rejects.toThrow(
      'Không tìm thấy bài viết'
    );
  });
});
