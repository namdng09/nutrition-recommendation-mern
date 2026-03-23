import { afterEach, describe, expect, it, vi } from 'vitest';

import { DishService } from '~/features/dishes/dish-service';
import { ROLE } from '~/shared/constants/role';
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

const mockFindByIdDish = vi.mocked(DishModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_ID = 'dish123';
const userId = 'user123';
const otherUserId = 'other-user-456';

const mockDish = {
  _id: { toString: () => VALID_ID },
  user: { _id: userId },
  name: 'Phở bò',
  image: 'pho-bo.jpg',
  deleteOne: vi.fn()
};

describe('DishService.deleteDish', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        DishService.deleteDish('invalid-id', userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ'
      });

      expect(mockFindByIdDish).not.toHaveBeenCalled();
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(null);

      await expect(
        DishService.deleteDish(VALID_ID, userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should throw 403 when non-owner tries to delete', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);

      await expect(
        DishService.deleteDish(VALID_ID, otherUserId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền xóa món ăn này'
      });
    });

    it('should delete dish successfully as owner', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);

      const result = await DishService.deleteDish(VALID_ID, userId, ROLE.USER);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(VALID_ID);
      expect(result.name).toBe('Phở bò');
    });

    it('should allow admin to delete any dish', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);

      const result = await DishService.deleteDish(
        VALID_ID,
        otherUserId,
        ROLE.ADMIN
      );

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(VALID_ID);
    });
  });

  describe('system', () => {
    it('should delete image when dish has image', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);

      await DishService.deleteDish(VALID_ID, userId, ROLE.USER);

      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
      expect(mockDish.deleteOne).toHaveBeenCalled();
    });

    it('should not call deleteImage when dish has no image', async () => {
      const dishWithoutImage = {
        ...mockDish,
        image: null
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(dishWithoutImage as any);

      await DishService.deleteDish(VALID_ID, userId, ROLE.USER);

      expect(mockDeleteImage).not.toHaveBeenCalled();
      expect(dishWithoutImage.deleteOne).toHaveBeenCalled();
    });
  });
});
