import type { QueryOptions } from '@quarks/mongoose-query-parser';

export const buildPaginateOptions = (parsed: QueryOptions): any => {
  const { sort, limit, skip: page, select, populate } = parsed;

  return {
    page: page || 1,
    limit: limit || 10,
    sort: sort || { createdAt: -1 },
    select,
    populate,
    customLabels: {
      totalDocs: 'totalDocs',
      totalPages: 'totalPages',
      page: 'page',
      hasPrevPage: 'hasPrevPage',
      hasNextPage: 'hasNextPage',
      limit: false,
      pagingCounter: false,
      prevPage: false,
      nextPage: false,
      offset: false
    }
  };
};
