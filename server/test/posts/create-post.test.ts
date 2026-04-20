import { afterEach, describe, expect, it, vi } from 'vitest';

import { createPostRequestSchema } from '~/features/posts/post-dto';
import { PostService } from '~/features/posts/post-service';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models/post-model';
import { uploadImage } from '~/shared/utils';

vi.mock('~/shared/database/models/post-model', () => ({
  PostModel: {
    findOne: vi.fn(),
    create: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    uploadImage: vi.fn(),
    deleteImage: vi.fn()
  };
});

const mockFindOne = vi.mocked(PostModel.findOne);
const mockCreate = vi.mocked(PostModel.create);
const mockUploadImage = vi.mocked(uploadImage);

const userId = 'user123';
const userName = 'Nutritionist';
const userAvatar = 'https://example.com/avatar.jpg';
const userRole = ROLE.NUTRITIONIST;

const validData = {
  title: 'Cách giảm cân khoa học',
  content: 'Nội dung bài viết đủ dài hơn mười ký tự',
  category: POST_CATEGORY.NUTRITION,
  tags: ['giam-can', 'dinh-duong'],
  isPublished: true
};

describe('PostService.createPost (UC36)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when title is missing', () => {
      const { title: _, ...data } = validData;
      const result = createPostRequestSchema.safeParse(data);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Tiêu đề không hợp lệ');
    });

    it('should fail when title is too short', () => {
      const result = createPostRequestSchema.safeParse({
        ...validData,
        title: 'a'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tiêu đề phải có ít nhất 2 ký tự'
      );
    });

    it('should fail when content is too short', () => {
      const result = createPostRequestSchema.safeParse({
        ...validData,
        content: 'a'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Nội dung phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 409 when post title already exists', async () => {
      mockFindOne.mockResolvedValue({ _id: 'post-1' } as any);

      await expect(
        PostService.createPost(
          userId,
          userName,
          userAvatar,
          userRole,
          validData
        )
      ).rejects.toMatchObject({
        status: 409,
        message: 'Bài viết với tiêu đề này đã tồn tại'
      });
    });

    it('should create post successfully', async () => {
      const mockSave = vi.fn();
      const postId = 'post-2';
      const mockPost = {
        _id: { toString: () => postId },
        ...validData,
        images: [],
        save: mockSave
      };

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockPost as any);
      mockUploadImage
        .mockResolvedValueOnce({
          success: true,
          data: { secure_url: 'https://img.test/post-2-0.jpg' }
        } as any)
        .mockResolvedValueOnce({
          success: true,
          data: { secure_url: 'https://img.test/post-2-1.jpg' }
        } as any);

      const files = [
        { buffer: Buffer.from('img-1') } as Express.Multer.File,
        { buffer: Buffer.from('img-2') } as Express.Multer.File
      ];

      const result = await PostService.createPost(
        userId,
        userName,
        userAvatar,
        userRole,
        validData,
        files
      );

      expect(mockUploadImage).toHaveBeenCalledWith(files[0].buffer, 'post-2-0');
      expect(mockUploadImage).toHaveBeenCalledWith(files[1].buffer, 'post-2-1');
      expect(mockPost.images).toEqual([
        'https://img.test/post-2-0.jpg',
        'https://img.test/post-2-1.jpg'
      ]);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });
  });
});
