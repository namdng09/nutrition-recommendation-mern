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
const mockFindById = vi.mocked(UserModel.findById);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const parsedQuery = { filter: {}, limit: 10 } as any;
const fakeOptions = { limit: 10, page: 1 };

const makeDocs = (items: Array<{ _id: string; name: string }>) =>
  items.map(item => ({ ...item, toObject: () => ({ ...item }) }));

const mockUser = (
  data: {
    blockDishes?: string[];
    favoriteDishes?: string[];
  } | null
) => {
  mockFindById.mockReturnValue({
    lean: vi.fn().mockResolvedValue(data)
  } as any);
};

describe('DishService.viewDishes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated dishes without any filter when no userId', async () => {
    const docs = makeDocs([
      { _id: 'id1', name: 'Phở bò' },
      { _id: 'id2', name: 'Bún chả' }
    ]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockPaginate.mockResolvedValue({
      docs,
      totalDocs: 2,
      limit: 10,
      page: 1
    } as any);

    const result = await DishService.viewDishes(parsedQuery);

    expect(mockPaginate).toHaveBeenCalledWith({}, fakeOptions);
    expect(result.docs).toHaveLength(2);
  });

  it('should apply filter when user has blockDishes', async () => {
    const blockedId = 'blocked-id-1';
    const docs = makeDocs([{ _id: 'id2', name: 'Bún chả' }]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockUser({ blockDishes: [blockedId], favoriteDishes: [] });
    mockPaginate.mockResolvedValue({ docs } as any);

    await DishService.viewDishes(parsedQuery, 'user-id');

    expect(mockPaginate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: { $nin: [blockedId] } }),
      fakeOptions
    );
  });

  it('should mark isFavorited=true only for dishes in user favorites', async () => {
    const favId = 'fav-id-1';
    const docs = makeDocs([
      { _id: favId, name: 'Phở bò' },
      { _id: 'id2', name: 'Bún chả' }
    ]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockUser({ blockDishes: [], favoriteDishes: [favId] });
    mockPaginate.mockResolvedValue({
      docs,
      totalDocs: 2,
      limit: 10,
      page: 1
    } as any);

    const result = await DishService.viewDishes(parsedQuery, 'user-id');

    expect((result.docs[0] as any).isFavorited).toBe(true);
    expect((result.docs[1] as any).isFavorited).toBe(false);
  });
});
