import { afterEach, describe, expect, it, vi } from 'vitest';

import { addDishToCollectionRequestSchema } from '~/features/collections/collection-dto';
import { CollectionService } from '~/features/collections/collection-service';
import { CollectionModel, DishModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  CollectionModel: {
    findById: vi.fn()
  },
  DishModel: {
    find: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindById = vi.mocked(CollectionModel.findById);
const mockFindDishes = vi.mocked(DishModel.find);
const mockValidateObjectId = vi.mocked(validateObjectId);

const VALID_ID = 'collection1';
const userId = 'user123';
const otherUserId = 'other-user-456';
const dishId1 = 'dish1';
const dishId2 = 'dish2';

describe('CollectionService.addDishToCollection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when dishIds is empty', () => {
      const result = addDishToCollectionRequestSchema.safeParse({
        dishIds: []
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Cần ít nhất một món ăn');
    });

    it('should fail when dishIds contains empty string', () => {
      const result = addDishToCollectionRequestSchema.safeParse({
        dishIds: ['']
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('ID món ăn là bắt buộc');
    });
  });

  describe('business logic', () => {
    it('should throw 400 when collection id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        CollectionService.addDishToCollection(VALID_ID, userId, {
          dishIds: [dishId1]
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bộ sưu tập không hợp lệ'
      });
    });

    it('should throw 404 when collection does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        CollectionService.addDishToCollection(VALID_ID, userId, {
          dishIds: [dishId1]
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bộ sưu tập'
      });
    });

    it('should throw 403 when user is not owner', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => otherUserId } },
        dishes: []
      } as any);

      await expect(
        CollectionService.addDishToCollection(VALID_ID, userId, {
          dishIds: [dishId1]
        })
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền sửa bộ sưu tập này'
      });
    });

    it('should throw 400 when dish already exists in collection', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => userId } },
        dishes: [{ dishId: { toString: () => dishId1 } }]
      } as any);

      await expect(
        CollectionService.addDishToCollection(VALID_ID, userId, {
          dishIds: [dishId1]
        })
      ).rejects.toMatchObject({
        status: 400,
        message: `Các món ăn sau đã tồn tại trong bộ sưu tập: ${dishId1}`
      });
    });

    it('should throw 400 when dish id format is invalid', async () => {
      mockValidateObjectId.mockImplementation((id: string) => id === VALID_ID);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => userId } },
        dishes: []
      } as any);

      await expect(
        CollectionService.addDishToCollection(VALID_ID, userId, {
          dishIds: [dishId1]
        })
      ).rejects.toMatchObject({
        status: 400,
        message: `Định dạng ID món ăn không hợp lệ: ${dishId1}`
      });
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => userId } },
        dishes: []
      } as any);
      mockFindDishes.mockResolvedValue([] as any);

      await expect(
        CollectionService.addDishToCollection(VALID_ID, userId, {
          dishIds: [dishId1]
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Một hoặc nhiều món ăn không tồn tại'
      });
    });

    it('should add dishes to collection successfully', async () => {
      const mockSave = vi.fn();
      const mockCollection = {
        user: { _id: { toString: () => userId } },
        dishes: [] as any[],
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockCollection as any);
      mockFindDishes.mockResolvedValue([
        {
          _id: dishId1,
          name: 'Pho bo',
          nutrition: { nutrients: [{ value: 250 }] },
          image: 'pho.jpg'
        },
        {
          _id: dishId2,
          name: 'Bun cha',
          nutrition: { nutrients: [{ value: 300 }] },
          image: 'bun.jpg'
        }
      ] as any);

      const result = await CollectionService.addDishToCollection(
        VALID_ID,
        userId,
        { dishIds: [dishId1, dishId2] }
      );

      expect(result.dishes).toHaveLength(2);
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
