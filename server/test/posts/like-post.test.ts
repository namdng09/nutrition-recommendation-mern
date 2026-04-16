import { afterEach, describe, expect, it, vi } from 'vitest';

import { PostService } from '~/features/posts/post-service';
import { PostModel } from '~/shared/database/models/post-model';
import { toObjectId, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models/post-model', () => ({
  PostModel: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn()
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
const mockFindByIdAndUpdate = vi.mocked(PostModel.findByIdAndUpdate);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockToObjectId = vi.mocked(toObjectId);

const postId = '507f1f77bcf86cd799439011';
const userId = 'user123';

describe('PostService.likePost (UC41/UC42)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when id format is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      PostService.likePost('invalid-id', userId)
    ).rejects.toMatchObject({
      status: 400,
      message: 'ID bài viết không hợp lệ'
    });
  });

  it('should throw 404 when post does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(null);

    await expect(PostService.likePost(postId, userId)).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bài viết'
    });
  });

  it('should like post when user has not liked yet', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({
      likes: [],
      author: { _id: { toString: () => 'author-1' } }
    } as any);

    const result = await PostService.likePost(postId, userId);

    expect(mockToObjectId).toHaveBeenCalledWith(userId);
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(postId, {
      $addToSet: { likes: 'oid-user123' }
    });
    expect(result).toEqual({ liked: true, likesCount: 1 });
  });

  it('should unlike post when user already liked', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({
      likes: [{ toString: () => userId }, { toString: () => 'u2' }],
      author: { _id: { toString: () => 'author-1' } }
    } as any);

    const result = await PostService.likePost(postId, userId);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(postId, {
      $pull: { likes: 'oid-user123' }
    });
    expect(result).toEqual({ liked: false, likesCount: 1 });
  });
});
