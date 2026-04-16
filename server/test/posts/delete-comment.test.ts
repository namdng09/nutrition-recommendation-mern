import { afterEach, describe, expect, it, vi } from 'vitest';

import { PostService } from '~/features/posts/post-service';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models/post-model';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models/post-model', () => ({
  PostModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindById = vi.mocked(PostModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

const postId = '507f1f77bcf86cd799439011';
const commentId = '507f1f77bcf86cd799439012';
const commentAuthorId = 'comment-author';
const postAuthorId = 'post-author';
const otherUserId = 'other-user';

const makePost = () => {
  const comments = [
    {
      _id: { toString: () => commentId },
      author: { _id: { toString: () => commentAuthorId } },
      content: 'comment 1'
    }
  ] as any[];

  return {
    _id: { toString: () => postId },
    author: { _id: { toString: () => postAuthorId } },
    comments,
    save: vi.fn()
  };
};

describe('PostService.deleteComment (UC44)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when post id format is invalid', async () => {
    mockValidateObjectId.mockReturnValueOnce(false);

    await expect(
      PostService.deleteComment(
        'invalid-id',
        commentId,
        commentAuthorId,
        ROLE.USER
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'ID bài viết không hợp lệ'
    });
  });

  it('should throw 400 when comment id format is invalid', async () => {
    mockValidateObjectId.mockReturnValueOnce(true).mockReturnValueOnce(false);

    await expect(
      PostService.deleteComment(
        postId,
        'invalid-comment-id',
        commentAuthorId,
        ROLE.USER
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'ID bình luận không hợp lệ'
    });
  });

  it('should throw 404 when post does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(null);

    await expect(
      PostService.deleteComment(postId, commentId, commentAuthorId, ROLE.USER)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bài viết'
    });
  });

  it('should throw 404 when comment does not exist', async () => {
    const post = makePost();
    post.comments = [];

    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(post as any);

    await expect(
      PostService.deleteComment(postId, commentId, commentAuthorId, ROLE.USER)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bình luận'
    });
  });

  it('should delete comment when actor is comment author', async () => {
    const post = makePost();

    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(post as any);

    await PostService.deleteComment(
      postId,
      commentId,
      commentAuthorId,
      ROLE.USER
    );

    expect(post.comments).toHaveLength(0);
    expect(post.save).toHaveBeenCalled();
  });

  it('should delete comment when actor is post author', async () => {
    const post = makePost();

    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(post as any);

    await PostService.deleteComment(
      postId,
      commentId,
      postAuthorId,
      ROLE.NUTRITIONIST
    );

    expect(post.comments).toHaveLength(0);
    expect(post.save).toHaveBeenCalled();
  });

  it('should delete comment when actor is admin', async () => {
    const post = makePost();

    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(post as any);

    await PostService.deleteComment(postId, commentId, otherUserId, ROLE.ADMIN);

    expect(post.comments).toHaveLength(0);
    expect(post.save).toHaveBeenCalled();
  });

  it('should throw 403 when actor has no permission', async () => {
    const post = makePost();

    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(post as any);

    await expect(
      PostService.deleteComment(postId, commentId, otherUserId, ROLE.USER)
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền xóa bình luận này'
    });
  });
});
