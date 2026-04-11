import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchPrivateDishes = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const response = await apiClient.get(
    `/api/dishes/private?${searchParams.toString()}`
  );

  return response.data.data;
};

export const usePrivateDishes = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PRIVATE_DISHES, params],
    queryFn: () => fetchPrivateDishes(params)
  });
};
