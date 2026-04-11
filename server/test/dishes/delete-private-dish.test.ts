import { afterEach, describe, expect, it, vi } from 'vitest';

import { DishService } from '~/features/dishes/dish-service';
import { DishModel } from '~/shared/database/models';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    findById: vi.fn()
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

const mockFindById = vi.mocked(DishModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_ID = 'dish123';
const userId = 'user123';
const otherUserId = 'other-user-456';

const mockDeleteOne = vi.fn();
const mockDish = {
  _id: { toString: () => VALID_ID },
  isPublic: false,
  user: { _id: { toString: () => userId } },
  name: 'Phở bò private',
  image: 'pho-bo-private.jpg',
  deleteOne: mockDeleteOne
};

describe('DishService.deletePrivateDish', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockDeleteOne.mockClear();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        DishService.deletePrivateDish('invalid-id', userId)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ'
      });
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        DishService.deletePrivateDish(VALID_ID, userId)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should throw 403 when dish is public', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({ ...mockDish, isPublic: true } as any);

      await expect(
        DishService.deletePrivateDish(VALID_ID, userId)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền xóa món ăn này'
      });
    });

    it('should throw 403 when user is not owner', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockDish as any);

      await expect(
        DishService.deletePrivateDish(VALID_ID, otherUserId)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền xóa món ăn này'
      });
    });

    it('should delete private dish successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockDish as any);
      mockDeleteImage.mockResolvedValue({ success: true } as any);

      const result = await DishService.deletePrivateDish(VALID_ID, userId);

      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(result._id.toString()).toBe(VALID_ID);
    });
  });
});
