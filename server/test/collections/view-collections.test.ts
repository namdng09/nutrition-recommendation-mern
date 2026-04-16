import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionService } from '~/features/collections/collection-service';
import { CollectionModel, UserModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  CollectionModel: {
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

const mockPaginate = vi.mocked(CollectionModel.paginate);
const mockFindById = vi.mocked(UserModel.findById);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const parsedQuery = { filter: {}, limit: 10 } as any;
const fakeOptions = { limit: 10, page: 1 };

const makeDocs = (items: Array<{ _id: string; name: string }>) =>
  items.map(item => ({ ...item, toObject: () => ({ ...item }) }));

const mockUser = (
  data: {
    favoriteCollections?: string[];
  } | null
) => {
  mockFindById.mockReturnValue({
    lean: vi.fn().mockResolvedValue(data)
  } as any);
};

describe('CollectionService.viewCollections', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return all collections when no userId is provided', async () => {
    const docs = makeDocs([
      { _id: 'id1', name: 'Collection 1' },
      { _id: 'id2', name: 'Collection 2' }
    ]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockPaginate.mockResolvedValue({
      docs,
      totalDocs: 2,
      limit: 10,
      page: 1
    } as any);

    const result = await CollectionService.viewCollections(parsedQuery);

    expect(mockPaginate).toHaveBeenCalledWith({}, fakeOptions);
    expect(result.docs).toHaveLength(2);
    expect((result.docs[0] as any).isFavorited).toBe(false);
  });

  it('should mark isFavorited=true only for collections in user favorites', async () => {
    const favId = 'fav-id-1';
    const docs = makeDocs([
      { _id: favId, name: 'Collection 1' },
      { _id: 'id2', name: 'Collection 2' }
    ]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockUser({ favoriteCollections: [favId] });
    mockPaginate.mockResolvedValue({
      docs,
      totalDocs: 2,
      limit: 10,
      page: 1
    } as any);

    const result = await CollectionService.viewCollections(
      parsedQuery,
      'user-id'
    );

    expect((result.docs[0] as any).isFavorited).toBe(true);
    expect((result.docs[1] as any).isFavorited).toBe(false);
  });
});
