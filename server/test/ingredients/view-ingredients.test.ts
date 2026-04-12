import { afterEach, describe, expect, it, vi } from 'vitest';

import { IngredientService } from '~/features/ingredients/ingredient-service';
import { IngredientModel, UserModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  IngredientModel: {
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

const mockPaginate = vi.mocked(IngredientModel.paginate);
const mockFindById = vi.mocked(UserModel.findById);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const parsedQuery = { filter: {}, limit: 10 } as any;
const fakeOptions = { limit: 10, page: 1 };

const makeDocs = (items: Array<{ _id: string; name: string }>) =>
  items.map(item => ({ ...item, toObject: () => ({ ...item }) }));

const mockUser = (
  data: {
    blockIngredients?: string[];
    favoriteIngredients?: string[];
  } | null
) => {
  mockFindById.mockReturnValue({
    lean: vi.fn().mockResolvedValue(data)
  } as any);
};

describe('IngredientService.viewIngredients', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated ingredients without any filter when no userId', async () => {
    const docs = makeDocs([
      { _id: 'id1', name: 'Cà chua' },
      { _id: 'id2', name: 'Thịt bò' }
    ]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockPaginate.mockResolvedValue({
      docs,
      totalDocs: 2,
      limit: 10,
      page: 1
    } as any);

    const result = await IngredientService.viewIngredients(parsedQuery);

    expect(mockPaginate).toHaveBeenCalledWith({}, fakeOptions);
    expect(result.docs).toHaveLength(2);
  });

  it('should apply filter when user has blockIngredients', async () => {
    const blockedId = 'blocked-id-1';
    const docs = makeDocs([{ _id: 'id2', name: 'Thịt bò' }]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockUser({ blockIngredients: [blockedId], favoriteIngredients: [] });
    mockPaginate.mockResolvedValue({ docs } as any);

    await IngredientService.viewIngredients(parsedQuery, 'user-id');

    expect(mockPaginate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: { $nin: [blockedId] } }),
      fakeOptions
    );
  });

  it('should mark isFavorited=true only for ingredients in user favorites', async () => {
    const favId = 'fav-id-1';
    const docs = makeDocs([
      { _id: favId, name: 'Cà chua' },
      { _id: 'id2', name: 'Thịt bò' }
    ]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockUser({ blockIngredients: [], favoriteIngredients: [favId] });
    mockPaginate.mockResolvedValue({
      docs,
      totalDocs: 2,
      limit: 10,
      page: 1
    } as any);

    const result = await IngredientService.viewIngredients(
      parsedQuery,
      'user-id'
    );

    expect((result.docs[0] as any).isFavorited).toBe(true);
    expect((result.docs[1] as any).isFavorited).toBe(false);
  });
});
