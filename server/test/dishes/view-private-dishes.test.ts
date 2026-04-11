import { afterEach, describe, expect, it, vi } from 'vitest';

import { DishService } from '~/features/dishes/dish-service';
import { DishModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    paginate: vi.fn()
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
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const parsedQuery = {
  filter: { categories: { $in: ['MainCourse'] } },
  limit: 10
} as any;
const fakeOptions = { limit: 10, page: 1 };
const userId = 'user123';

const makeDocs = (items: Array<{ _id: string; name: string }>) =>
  items.map(item => ({ ...item, toObject: () => ({ ...item }) }));

describe('DishService.viewPrivateDishes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated private dishes with user filter', async () => {
    const docs = makeDocs([
      { _id: 'id1', name: 'Phở bò private' },
      { _id: 'id2', name: 'Bún chả private' }
    ]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockPaginate.mockResolvedValue({
      docs,
      totalDocs: 2,
      limit: 10,
      page: 1
    } as any);

    const result = await DishService.viewPrivateDishes(parsedQuery, userId);

    expect(mockPaginate).toHaveBeenCalledWith(
      {
        ...parsedQuery.filter,
        isPublic: false,
        'user._id': userId
      },
      fakeOptions
    );
    expect(result.docs).toHaveLength(2);
  });
});
