import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionService } from '~/features/collections/collection-service';
import {
  CollectionModel,
  DishModel,
  UserModel
} from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  CollectionModel: {
    findById: vi.fn()
  },
  DishModel: {
    find: vi.fn()
  },
  UserModel: {
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
const mockFindDishes = vi.mocked(DishModel.find);
const mockFindByIdUser = vi.mocked(UserModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

const VALID_ID = 'collection1';
const mockCollection = {
  _id: { toString: () => VALID_ID },
  name: 'Bo suu tap A',
  dishes: [
    { dishId: 'dish1', name: 'Pho bo' },
    { dishId: 'dish2', name: 'Bun cha' }
  ],
  toObject: function () {
    return this;
  }
};

describe('CollectionService.viewCollectionDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        CollectionService.viewCollectionDetail('invalid-id')
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID bộ sưu tập không hợp lệ'
      });
    });

    it('should throw 404 when collection does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        CollectionService.viewCollectionDetail(VALID_ID)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy bộ sưu tập'
      });
    });

    it('should return collection detail successfully without userId', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockCollection as any);
      mockFindDishes.mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: 'dish1' }])
      } as any);

      const result = await CollectionService.viewCollectionDetail(VALID_ID);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(VALID_ID);
      expect(result.name).toBe('Bo suu tap A');
      expect(result.isFavorited).toBe(false);
      expect((result.dishes[0] as any).isDeleted).toBe(false);
      expect((result.dishes[1] as any).isDeleted).toBe(true);
    });

    it('should return collection detail with favorite status when userId provided', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockCollection as any);
      mockFindDishes.mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: 'dish1' }, { _id: 'dish2' }])
      } as any);
      mockFindByIdUser.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ favoriteCollections: [VALID_ID] })
      } as any);

      const result = await CollectionService.viewCollectionDetail(
        VALID_ID,
        'user-id'
      );

      expect(result.isFavorited).toBe(true);
    });
  });
});
