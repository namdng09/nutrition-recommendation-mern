import { afterEach, describe, expect, it, vi } from 'vitest';

import { DishService } from '~/features/dishes/dish-service';
import { DishModel, UserModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    paginate: vi.fn()
  },
  UserModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    buildPaginateOptions: vi.fn()
  };
});

const mockPaginate = vi.mocked(DishModel.paginate);
const mockFindByIdUser = vi.mocked(UserModel.findById);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

describe('DishService.viewDishes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should return paginated dishes successfully', async () => {
      const fakeOptions = { limit: 10, page: 1 };
      const fakeResult = {
        docs: [
          { name: 'Phở bò', _id: 'id1' },
          { name: 'Bún chả', _id: 'id2' },
          { name: 'Salad rau', _id: 'id3' }
        ],
        totalDocs: 3,
        limit: 10,
        page: 1
      };

      mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
      mockPaginate.mockResolvedValue(fakeResult as any);

      const result = await DishService.viewDishes({
        filter: {},
        limit: 10
      } as any);

      expect(result).toBeDefined();
      expect(result.docs).toBeDefined();
      expect(Array.isArray(result.docs)).toBe(true);
      expect(result.docs.length).toBe(3);
      expect(result.totalDocs).toBe(3);
    });

    it('should filter out blocked dishes when userId is provided', async () => {
      const userId = 'user123';
      const fakeOptions = { limit: 10, page: 1 };
      const fakeUser = {
        blockDishes: ['blocked-id-1'],
        favoriteDishes: ['favorite-id-1']
      };
      const fakeResult = {
        docs: [
          { name: 'Phở bò', _id: 'favorite-id-1' },
          { name: 'Bún chả', _id: 'id2' }
        ],
        totalDocs: 2,
        limit: 10,
        page: 1
      };

      mockFindByIdUser.mockReturnValue({
        lean: vi.fn().mockResolvedValue(fakeUser)
      } as any);
      mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
      mockPaginate.mockResolvedValue(fakeResult as any);

      const result = await DishService.viewDishes(
        {
          filter: {},
          limit: 10
        } as any,
        userId
      );

      expect(result).toBeDefined();
      expect(result.docs.length).toBe(2);
    });

    it('should add isFavorited flag to dishes', async () => {
      const userId = 'user123';
      const fakeOptions = { limit: 10, page: 1 };
      const fakeUser = {
        blockDishes: [],
        favoriteDishes: ['id1']
      };
      const fakeResult = {
        docs: [
          {
            name: 'Phở bò',
            _id: 'id1',
            toObject: vi.fn(() => ({ name: 'Phở bò', _id: 'id1' }))
          },
          {
            name: 'Bún chả',
            _id: 'id2',
            toObject: vi.fn(() => ({ name: 'Bún chả', _id: 'id2' }))
          }
        ],
        totalDocs: 2,
        limit: 10,
        page: 1
      };

      mockFindByIdUser.mockReturnValue({
        lean: vi.fn().mockResolvedValue(fakeUser)
      } as any);
      mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
      mockPaginate.mockResolvedValue(fakeResult as any);

      const result = await DishService.viewDishes(
        {
          filter: {},
          limit: 10
        } as any,
        userId
      );

      expect(result.docs.length).toBe(2);
    });
  });
});
