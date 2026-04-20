import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCommentRequestSchema } from '~/features/posts/post-dto';
import { PostService } from '~/features/posts/post-service';
import { PostModel } from '~/shared/database/models/post-model';
import { toObjectId, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models/post-model', () => ({
  PostModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    toObjectId: vi.fn((id: string) => `oid-${id}`)
  };
});

const mockFindById = vi.mocked(PostModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockToObjectId = vi.mocked(toObjectId);

const postId = '507f1f77bcf86cd799439011';
const userId = 'user123';
const userName = 'User Test';
const userAvatar = 'https://example.com/avatar.jpg';

const validComment = {
  content: 'Bai viet rat huu ich'
};

describe('PostService.addComment (UC43)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when comment content is empty', () => {
      const result = createCommentRequestSchema.safeParse({ content: 'a' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Nội dung bình luận phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when post id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        PostService.addComment(
          'invalid-id',
          userId,
          userName,
          userAvatar,
          validComment
        )
      ).rejects.toMatchObject({
        status: 400,
        message: 'ID bài viết không hợp lệ'
      });
    });

    it('should throw 404 when post does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        PostService.addComment(
          postId,
          userId,
          userName,
          userAvatar,
          validComment
        )
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bài viết'
      });
    });

    it('should append comment to post discussion thread', async () => {
      const comments: any[] = [];
      const mockSave = vi.fn();
      const mockPost = {
        author: { _id: { toString: () => 'author-1' } },
        comments,
        save: mockSave
      };

      const pushSpy = vi.spyOn(comments, 'push');

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockPost as any);

      const result = await PostService.addComment(
        postId,
        userId,
        userName,
        userAvatar,
        validComment
      );

      expect(mockToObjectId).toHaveBeenCalledWith(userId);
      expect(pushSpy).toHaveBeenCalledTimes(1);
      expect(result.content).toBe(validComment.content);
      expect(result.author?.name).toBe(userName);
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
