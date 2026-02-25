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

describe('PostService.addComment', () => {
  let userId: string;
  let userName: string;
  let userAvatar: string;
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

    userId = new mongoose.Types.ObjectId().toString();
    userName = 'Test User';
    userAvatar = 'https://example.com/avatar.jpg';

    // Create test post
    const nutritionistId = new mongoose.Types.ObjectId().toString();
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
      comments: []
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
  it('should add comment successfully', async () => {
    const commentData = {
      content: 'Bài viết rất hay và bổ ích!'
    };

    const comment = await PostService.addComment(
      postId,
      userId,
      userName,
      userAvatar,
      commentData
    );

    expect(comment).toBeDefined();
    expect(comment.content).toBe('Bài viết rất hay và bổ ích!');
    expect(comment.author._id.toString()).toBe(userId);
    expect(comment.author.name).toBe(userName);
    expect(comment.createdAt).toBeDefined();
  });

  // Branch - Invalid ID
  it('should throw error when id format is invalid', async () => {
    const commentData = {
      content: 'Bình luận test'
    };

    await expect(
      PostService.addComment(
        'invalid-id',
        userId,
        userName,
        userAvatar,
        commentData
      )
    ).rejects.toThrow('ID bài viết không hợp lệ');
  });

  // Branch - Post not found
  it('should throw error when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const commentData = {
      content: 'Bình luận test'
    };

    await expect(
      PostService.addComment(
        nonExistentId,
        userId,
        userName,
        userAvatar,
        commentData
      )
    ).rejects.toThrow('Không tìm thấy bài viết');
  });
});
