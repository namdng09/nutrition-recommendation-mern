import { afterEach, describe, expect, it, vi } from 'vitest';

import { PostService } from '~/features/posts/post-service';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models/post-model';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models/post-model', () => ({
  PostModel: {
    findById: vi.fn(),
    findByIdAndDelete: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    deleteImage: vi.fn()
  };
});

const mockFindById = vi.mocked(PostModel.findById);
const mockFindByIdAndDelete = vi.mocked(PostModel.findByIdAndDelete);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);

const postId = '507f1f77bcf86cd799439011';
const userId = 'user123';
const adminId = 'admin123';

describe('PostService.deletePost (UC40)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when id format is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      PostService.deletePost('invalid-id', userId, ROLE.NUTRITIONIST)
    ).rejects.toMatchObject({
      status: 400,
      message: 'ID bài viết không hợp lệ'
    });
  });

  it('should throw 404 when post does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(null);

    await expect(
      PostService.deletePost(postId, userId, ROLE.NUTRITIONIST)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bài viết'
    });
  });

  it('should throw 403 when user is not post author', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({
      _id: { toString: () => postId },
      author: { _id: { toString: () => 'other-user' } },
      images: []
    } as any);

    await expect(
      PostService.deletePost(postId, userId, ROLE.NUTRITIONIST)
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền xóa bài viết này'
    });
  });

  it('should delete post and all post images as author', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({
      _id: { toString: () => postId },
      author: { _id: { toString: () => userId } },
      images: ['img-1.jpg', 'img-2.jpg']
    } as any);

    await PostService.deletePost(postId, userId, ROLE.NUTRITIONIST);

    expect(mockDeleteImage).toHaveBeenCalledWith(`${postId}-0`);
    expect(mockDeleteImage).toHaveBeenCalledWith(`${postId}-1`);
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(postId);
  });

  it('should allow admin to delete any post', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({
      _id: { toString: () => postId },
      author: { _id: { toString: () => userId } },
      images: []
    } as any);

    await PostService.deletePost(postId, adminId, ROLE.ADMIN);

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(postId);
  });
});
