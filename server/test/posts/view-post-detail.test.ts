import { afterEach, describe, expect, it, vi } from 'vitest';

import { PostService } from '~/features/posts/post-service';
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

describe('PostService.viewPostDetail (UC38)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when id format is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      PostService.viewPostDetail('invalid-id')
    ).rejects.toMatchObject({
      status: 400,
      message: 'ID bài viết không hợp lệ'
    });
  });

  it('should throw 404 when post does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(null);

    await expect(
      PostService.viewPostDetail('507f1f77bcf86cd799439011')
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bài viết'
    });
  });

  it('should return post detail and increment views', async () => {
    const mockSave = vi.fn();
    const mockPost = {
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      title: 'Cach giam can',
      content: 'Noi dung bai viet',
      views: 10,
      save: mockSave
    };

    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(mockPost as any);

    const result = await PostService.viewPostDetail('507f1f77bcf86cd799439011');

    expect(result).toEqual(mockPost);
    expect(mockPost.views).toBe(11);
    expect(mockSave).toHaveBeenCalled();
  });
});
