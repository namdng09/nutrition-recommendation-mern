import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchGroceries = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const response = await apiClient.get(
    `/api/groceries?${searchParams.toString()}`
  );
  return response.data.data;
};

export const useGroceries = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.GROCERIES, params],
    queryFn: () => fetchGroceries(params)
  });
};
