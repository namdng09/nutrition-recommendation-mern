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

describe('PostService.deleteComment', () => {
  let userId: string;
  let otherUserId: string;
  let postAuthorId: string;
  let adminId: string;
  let postId: string;
  let commentId: string;

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
    otherUserId = new mongoose.Types.ObjectId().toString();
    postAuthorId = new mongoose.Types.ObjectId().toString();
    adminId = new mongoose.Types.ObjectId().toString();

    // Create test post with comment
    const post = await PostModel.create({
      author: {
        _id: postAuthorId,
        name: 'Test Nutritionist',
        role: ROLE.NUTRITIONIST
      },
      title: 'Bài viết test',
      content: 'Nội dung bài viết test...',
      slug: 'bai-viet-test',
      isPublished: true,
      comments: [
        {
          author: {
            _id: userId,
            name: 'Test User',
            avatar: ''
          },
          content: 'Bình luận test',
          createdAt: new Date()
        }
      ]
    });
    postId = post._id.toString();
    commentId = (post.comments[0] as any)._id.toString();
  });

  afterEach(async () => {
    // Clean up after each test
    await PostModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case: comment author deletes
  it('should delete comment as comment author successfully', async () => {
    await PostService.deleteComment(postId, commentId, userId, ROLE.USER);

    // Verify comment is deleted
    const updatedPost = await PostModel.findById(postId);
    expect(updatedPost?.comments.length).toBe(0);
  });

  it('should delete comment as post author successfully', async () => {
    await PostService.deleteComment(
      postId,
      commentId,
      postAuthorId,
      ROLE.NUTRITIONIST
    );

    // Verify comment is deleted
    const updatedPost = await PostModel.findById(postId);
    expect(updatedPost?.comments.length).toBe(0);
  });

  it('should delete comment as admin successfully', async () => {
    await PostService.deleteComment(postId, commentId, adminId, ROLE.ADMIN);

    // Verify comment is deleted
    const updatedPost = await PostModel.findById(postId);
    expect(updatedPost?.comments.length).toBe(0);
  });

  // Branch - Unauthorized user
  it('should throw error when deleting comment of another user', async () => {
    await expect(
      PostService.deleteComment(postId, commentId, otherUserId, ROLE.USER)
    ).rejects.toThrow('Bạn không có quyền xóa bình luận này');
  });

  // Branch - Invalid post ID
  it('should throw error when post id format is invalid', async () => {
    await expect(
      PostService.deleteComment('invalid-id', commentId, userId, ROLE.USER)
    ).rejects.toThrow('ID bài viết không hợp lệ');
  });

  // Branch - Invalid comment ID
  it('should throw error when comment id format is invalid', async () => {
    await expect(
      PostService.deleteComment(postId, 'invalid-comment-id', userId, ROLE.USER)
    ).rejects.toThrow('ID bình luận không hợp lệ');
  });

  // Branch - Post not found
  it('should throw error when post does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      PostService.deleteComment(nonExistentId, commentId, userId, ROLE.USER)
    ).rejects.toThrow('Không tìm thấy bài viết');
  });

  // Branch - Comment not found
  it('should throw error when comment does not exist', async () => {
    const nonExistentCommentId = new mongoose.Types.ObjectId().toString();

    await expect(
      PostService.deleteComment(postId, nonExistentCommentId, userId, ROLE.USER)
    ).rejects.toThrow('Không tìm thấy bình luận');
  });
});
