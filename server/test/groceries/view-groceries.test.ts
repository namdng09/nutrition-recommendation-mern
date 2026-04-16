import { afterEach, describe, expect, it, vi } from 'vitest';

import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel, IngredientModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: {
    paginate: vi.fn()
  },
  IngredientModel: {
    find: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    buildPaginateOptions: vi.fn()
  };
});

const mockPaginate = vi.mocked(GroceryModel.paginate);
const mockIngredientFind = vi.mocked(IngredientModel.find);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const userId = 'user123';
const parsedQuery = { filter: {}, limit: 10 } as any;
const fakeOptions = { limit: 10, page: 1 };

const makeDoc = (data: any) => ({
  ...data,
  toObject: () => ({ ...data })
});

describe('GroceryService.viewGroceries (UC29)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return user groceries successfully', async () => {
    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockPaginate.mockResolvedValue({
      docs: [
        makeDoc({
          _id: 'g1',
          name: 'Danh sach 1',
          ingredients: [
            { ingredientId: 'ing-1', name: 'Ca chua', isPurchased: false }
          ]
        })
      ],
      totalDocs: 1,
      page: 1,
      limit: 10
    } as any);
    mockIngredientFind.mockReturnValue({
      lean: vi.fn().mockResolvedValue([{ _id: { toString: () => 'ing-1' } }])
    } as any);

    const result = await GroceryService.viewGroceries(userId, parsedQuery);

    expect(mockPaginate).toHaveBeenCalledWith(
      { 'user._id': userId },
      fakeOptions
    );
    expect(result.docs).toHaveLength(1);
    expect((result.docs[0] as any).ingredients[0].isDeleted).toBe(false);
  });
});
