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
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models';

describe('PostService.likePost', () => {
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

    userId = new mongoose.Types.ObjectId().toString();
    const nutritionistId = new mongoose.Types.ObjectId().toString();

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

    // Create post with existing likes
    const otherUserId = new mongoose.Types.ObjectId();
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

  afterEach(async () => {
    // Clean up after each test
    await PostModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case: like post
  it('should like post successfully', async () => {
    const result = await PostService.likePost(postId, userId);

    expect(result).toBeDefined();
    expect(result.liked).toBe(true);
    expect(result.likesCount).toBe(1);
  });

  it('should unlike post successfully', async () => {
    const result = await PostService.likePost(postWithLikesId, userId);

    expect(result).toBeDefined();
    expect(result.liked).toBe(false);
    expect(result.likesCount).toBe(1); // Should be 1 after removing user's like
  });

  // Branch - Invalid ID
  it('should throw error when id format is invalid', async () => {
    await expect(PostService.likePost('invalid-id', userId)).rejects.toThrow(
      'ID bài viết không hợp lệ'
    );
  });

  // Branch - Post not found
  it('should throw error when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(PostService.likePost(nonExistentId, userId)).rejects.toThrow(
      'Không tìm thấy bài viết'
    );
  });
});
