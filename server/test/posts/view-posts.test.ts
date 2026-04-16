import { afterEach, describe, expect, it, vi } from 'vitest';

import { PostService } from '~/features/posts/post-service';
import { PostModel } from '~/shared/database/models/post-model';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models/post-model', () => ({
  PostModel: {
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

const mockPaginate = vi.mocked(PostModel.paginate);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const parsedQuery = { filter: {}, limit: 10 } as any;
const fakeOptions = { limit: 10, page: 1 };

const makeDocs = (
  items: Array<{ _id: string; title: string; isPublished: boolean }>
) => items.map(item => ({ ...item, toObject: () => ({ ...item }) }));

describe('PostService.viewPosts (UC37)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return posts list successfully', async () => {
    const docs = makeDocs([
      { _id: 'id1', title: 'Bai viet 1', isPublished: true },
      { _id: 'id2', title: 'Bai viet 2', isPublished: false }
    ]);

    mockBuildPaginateOptions.mockReturnValue(fakeOptions as any);
    mockPaginate.mockResolvedValue({
      docs,
      totalDocs: 2,
      limit: 10,
      page: 1
    } as any);

    const result = await PostService.viewPosts(parsedQuery);

    expect(mockPaginate).toHaveBeenCalledWith({}, fakeOptions);
    expect(result.docs).toHaveLength(2);
  });
});
