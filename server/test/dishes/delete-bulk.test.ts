import { afterEach, describe, expect, it, vi } from 'vitest';

import { DishService } from '~/features/dishes/dish-service';
import { ROLE } from '~/shared/constants/role';
import { DishModel } from '~/shared/database/models';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
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

const mockFind = vi.mocked(DishModel.find);
const mockDeleteMany = vi.mocked(DishModel.deleteMany);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_IDS = ['dish1', 'dish2', 'dish3'];
const userId = 'user123';
const otherUserId = 'other-user-456';
const ADMIN_USER = 'admin-user';

const mockDishes = [
  {
    _id: { toString: () => 'dish1' },
    user: { _id: { toString: () => userId } },
    image: 'dish1.jpg'
  },
  {
    _id: { toString: () => 'dish2' },
    user: { _id: { toString: () => userId } },
    image: 'dish2.jpg'
  },
  {
    _id: { toString: () => 'dish3' },
    user: { _id: { toString: () => userId } },
    image: ''
  }
];

describe('DishService.deleteBulk', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true);
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        DishService.deleteBulk(VALID_IDS, userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ: dish2'
      });

      expect(mockFind).not.toHaveBeenCalled();
    });

    it('should throw 403 when non-admin user tries to delete dishes not owned by them', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue([
        {
          _id: { toString: () => 'dish1' },
          user: { _id: { toString: () => otherUserId } },
          image: 'dish1.jpg'
        }
      ] as any);

      await expect(
        DishService.deleteBulk(['dish1'], userId, ROLE.USER)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền xóa một số món ăn này'
      });

      expect(mockDeleteMany).not.toHaveBeenCalled();
    });

    it('should allow admin to delete dishes not owned by them', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const adminDishes = [
        {
          _id: { toString: () => 'dish1' },
          user: { _id: { toString: () => otherUserId } },
          image: 'dish1.jpg'
        }
      ];
      mockFind.mockResolvedValue(adminDishes as any);
      mockDeleteMany.mockResolvedValue({ deletedCount: 1 } as any);

      await DishService.deleteBulk(['dish1'], ADMIN_USER, ROLE.ADMIN);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        _id: { $in: ['dish1'] }
      });
      expect(mockDeleteImage).toHaveBeenCalledWith('dish1');
    });

    it('should delete images for dishes with images and skip empty ones', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue(mockDishes as any);
      mockDeleteMany.mockResolvedValue({ deletedCount: 3 } as any);

      await DishService.deleteBulk(VALID_IDS, userId, ROLE.USER);

      expect(mockDeleteImage).toHaveBeenCalledWith('dish1');
      expect(mockDeleteImage).toHaveBeenCalledWith('dish2');
      expect(mockDeleteImage).toHaveBeenCalledTimes(2);
      expect(mockDeleteMany).toHaveBeenCalledWith({
        _id: { $in: VALID_IDS }
      });
    });

    it('should return delete result with correct deletedCount', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue(mockDishes as any);
      const deleteResult = {
        deletedCount: 3,
        acknowledged: true
      };
      mockDeleteMany.mockResolvedValue(deleteResult as any);

      const result = await DishService.deleteBulk(VALID_IDS, userId, ROLE.USER);

      expect(result).toEqual(deleteResult);
    });

    it('should handle case when no dishes found to delete', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFind.mockResolvedValue([] as any);
      mockDeleteMany.mockResolvedValue({ deletedCount: 0 } as any);

      const result = await DishService.deleteBulk(VALID_IDS, userId, ROLE.USER);

      expect(result.deletedCount).toBe(0);
    });
  });
});
