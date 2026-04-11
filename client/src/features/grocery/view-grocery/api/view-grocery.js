import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchGroceries = async params => {
  const normalizedParams = { ...params };

  if (!normalizedParams.name?.trim()) {
    delete normalizedParams.name;
  }

  delete normalizedParams.status;

  const searchParams = buildQueryParams(normalizedParams, ['name']);

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  if (params.page) {
    searchParams.set('page', params.page.toString());
  }

  const response = await apiClient.get(
    `/api/groceries?${searchParams.toString()}`
  );
  return response.data.data;
};

export const useGroceries = (filters = {}, page = 1) => {
  const name = filters.name ?? filters.search ?? '';

  const params = {
    ...filters,
    name,
    page
  };

  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.GROCERIES, params],
    queryFn: () => fetchGroceries(params)
  });
};
