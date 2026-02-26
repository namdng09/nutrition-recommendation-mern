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

describe('PostService.viewPostBySlug', () => {
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

    // Create published post
    await PostModel.create({
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

    // Create unpublished post
    await PostModel.create({
      author: {
        _id: userId,
        name: 'Test User',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết chưa xuất bản',
      content: 'Nội dung bài viết chưa xuất bản...',
      slug: 'bai-viet-unpublished',
      isPublished: false
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
  it('should get post by slug successfully and increment views', async () => {
    const post = await PostService.viewPostBySlug('cach-giam-can-hieu-qua');

    expect(post).toBeDefined();
    expect(post.title).toBe('Cách giảm cân hiệu quả');
    expect(post.slug).toBe('cach-giam-can-hieu-qua');
    expect(post.views).toBe(11);
    expect(post.isPublished).toBe(true);
  });

  // Branch - Post not found
  it('should throw error when post does not exist', async () => {
    await expect(
      PostService.viewPostBySlug('nonexistent-slug')
    ).rejects.toThrow('Không tìm thấy bài viết');
  });

  // Branch - Unpublished post
  it('should throw error for unpublished post', async () => {
    await expect(
      PostService.viewPostBySlug('bai-viet-unpublished')
    ).rejects.toThrow('Không tìm thấy bài viết');
  });
});
