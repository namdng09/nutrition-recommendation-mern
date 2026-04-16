import { afterEach, describe, expect, it, vi } from 'vitest';

import { deleteBulkRequestSchema } from '~/features/dishes/dish-dto';
import { DishService } from '~/features/dishes/dish-service';
import { ROLE } from '~/shared/constants/role';
import { DishModel } from '~/shared/database/models';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    findById: vi.fn(),
    find: vi.fn(),
    deleteMany: vi.fn()
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
const mockFind = vi.mocked(DishModel.find);
const mockDeleteMany = vi.mocked(DishModel.deleteMany);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_ID = 'dish123';
const VALID_IDS = ['dish1', 'dish2'];
const userId = 'user123';
const otherUserId = 'other-user-456';

const mockDeleteOne = vi.fn();
const mockDish = {
  _id: { toString: () => VALID_ID },
  user: { _id: userId },
  name: 'Phở bò',
  image: 'pho-bo.jpg',
  deleteOne: mockDeleteOne
};

describe('DishService.deleteDish', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockDeleteOne.mockClear();
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
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        DishService.deleteDish(VALID_ID, userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should throw 403 when non-owner tries to delete', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockDish as any);

      await expect(
        DishService.deleteDish(VALID_ID, otherUserId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền xóa món ăn này'
      });
    });

    it('should delete dish successfully as owner', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockDish as any);
      mockDeleteImage.mockResolvedValue({ success: true } as any);

      const result = await DishService.deleteDish(VALID_ID, userId, ROLE.USER);

      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(result._id.toString()).toBe(VALID_ID);
    });

    it('should allow admin to delete any dish', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockDish as any);

      const result = await DishService.deleteDish(
        VALID_ID,
        otherUserId,
        ROLE.ADMIN
      );

      expect(result._id.toString()).toBe(VALID_ID);
    });
  });
});
