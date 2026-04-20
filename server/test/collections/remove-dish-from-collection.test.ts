import { afterEach, describe, expect, it, vi } from 'vitest';

import { removeDishFromCollectionRequestSchema } from '~/features/collections/collection-dto';
import { CollectionService } from '~/features/collections/collection-service';
import { CollectionModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  CollectionModel: {
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

const mockFindById = vi.mocked(CollectionModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

const VALID_ID = 'collection1';
const userId = 'user123';
const otherUserId = 'other-user-456';
const dishId1 = 'dish1';
const dishId2 = 'dish2';

describe('CollectionService.removeDishFromCollection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when dishIds is empty', () => {
      const result = removeDishFromCollectionRequestSchema.safeParse({
        dishIds: []
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Cần ít nhất một món ăn');
    });

    it('should fail when dishIds contains empty string', () => {
      const result = removeDishFromCollectionRequestSchema.safeParse({
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
        CollectionService.removeDishFromCollection(VALID_ID, userId, {
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
        CollectionService.removeDishFromCollection(VALID_ID, userId, {
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
        CollectionService.removeDishFromCollection(VALID_ID, userId, {
          dishIds: [dishId1]
        })
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền sửa bộ sưu tập này'
      });
    });

    it('should throw 404 when no dish is found', async () => {
      const collection = {
        user: { _id: { toString: () => userId } },
        dishes: [{ dishId: { toString: () => dishId2 } }],
        set: vi.fn(function (
          this: { dishes: any[] },
          _key: string,
          value: any[]
        ) {
          this.dishes = value;
        }),
        save: vi.fn()
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(collection as any);

      await expect(
        CollectionService.removeDishFromCollection(VALID_ID, userId, {
          dishIds: [dishId1]
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn nào trong bộ sưu tập'
      });
    });

    it('should remove dishes from collection successfully', async () => {
      const collection = {
        user: { _id: { toString: () => userId } },
        dishes: [
          { dishId: { toString: () => dishId1 } },
          { dishId: { toString: () => dishId2 } }
        ],
        set: vi.fn(function (
          this: { dishes: any[] },
          _key: string,
          value: any[]
        ) {
          this.dishes = value;
        }),
        save: vi.fn()
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(collection as any);

      const result = await CollectionService.removeDishFromCollection(
        VALID_ID,
        userId,
        { dishIds: [dishId1] }
      );

      expect(result.dishes).toHaveLength(1);
      expect(result.dishes[0].dishId?.toString()).toBe(dishId2);
      expect(collection.save).toHaveBeenCalled();
    });
  });
});
