import { afterEach, describe, expect, it, vi } from 'vitest';

import { updatePostRequestSchema } from '~/features/posts/post-dto';
import { PostService } from '~/features/posts/post-service';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models/post-model';
import { deleteImage, uploadImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models/post-model', () => ({
  PostModel: {
    findById: vi.fn(),
    findOne: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    uploadImage: vi.fn(),
    deleteImage: vi.fn()
  };
});

const mockFindById = vi.mocked(PostModel.findById);
const mockFindOne = vi.mocked(PostModel.findOne);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockUploadImage = vi.mocked(uploadImage);
const mockDeleteImage = vi.mocked(deleteImage);

const postId = '507f1f77bcf86cd799439011';
const userId = 'user123';
const adminId = 'admin123';

const validData = {
  title: 'Bai viet cap nhat',
  content: 'Noi dung cap nhat du dai hon muoi ky tu'
};

describe('PostService.updatePost (UC39)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when title is too short', () => {
      const result = updatePostRequestSchema.safeParse({
        title: 'a'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tiêu đề phải có ít nhất 2 ký tự'
      );
    });

    it('should fail when content is too short', () => {
      const result = updatePostRequestSchema.safeParse({
        content: 'a'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Nội dung phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        PostService.updatePost(
          'invalid-id',
          userId,
          ROLE.NUTRITIONIST,
          validData
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
        PostService.updatePost(postId, userId, ROLE.NUTRITIONIST, validData)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bài viết'
      });
    });

    it('should throw 403 when user is not post author', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        _id: { toString: () => postId },
        author: { _id: { toString: () => 'other-user' } }
      } as any);

      await expect(
        PostService.updatePost(postId, userId, ROLE.NUTRITIONIST, validData)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền cập nhật bài viết này'
      });
    });

    it('should throw 409 when updating to duplicate title', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        _id: { toString: () => postId },
        author: { _id: { toString: () => userId } },
        title: 'Bai viet cu'
      } as any);
      mockFindOne.mockResolvedValue({ _id: 'another-post' } as any);

      await expect(
        PostService.updatePost(postId, userId, ROLE.NUTRITIONIST, {
          title: 'Bai viet trung tieu de'
        })
      ).rejects.toMatchObject({
        status: 409,
        message: 'Bài viết với tiêu đề này đã tồn tại'
      });
    });

    it('should allow admin to update post', async () => {
      const mockSave = vi.fn();
      const mockPost = {
        _id: { toString: () => postId },
        author: { _id: { toString: () => userId } },
        title: 'Bai viet cu',
        content: 'Noi dung cu',
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockPost as any);

      const result = await PostService.updatePost(postId, adminId, ROLE.ADMIN, {
        content: 'Admin da cap nhat bai viet'
      });

      expect(result.content).toBe('Admin da cap nhat bai viet');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should update post and replace images successfully', async () => {
      const mockSave = vi.fn();
      const mockPost = {
        _id: { toString: () => postId },
        author: { _id: { toString: () => userId } },
        title: 'Bai viet cu',
        content: 'Noi dung cu',
        images: ['old-1.jpg', 'old-2.jpg'],
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockPost as any);
      mockFindOne.mockResolvedValue(null);
      mockUploadImage.mockResolvedValue({
        success: true,
        data: { secure_url: 'https://img.test/new-0.jpg' }
      } as any);

      const files = [{ buffer: Buffer.from('new-img') } as Express.Multer.File];

      const result = await PostService.updatePost(
        postId,
        userId,
        ROLE.NUTRITIONIST,
        {
          ...validData,
          isPublished: true
        },
        files
      );

      expect(mockDeleteImage).toHaveBeenCalledWith(`${postId}-0`);
      expect(mockDeleteImage).toHaveBeenCalledWith(`${postId}-1`);
      expect(mockUploadImage).toHaveBeenCalledWith(
        files[0].buffer,
        `${postId}-0`
      );
      expect(result.images).toEqual(['https://img.test/new-0.jpg']);
      expect(result.publishedAt).toBeDefined();
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
