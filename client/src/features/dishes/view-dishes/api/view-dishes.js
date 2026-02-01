import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchDishes = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const response = await apiClient.get(
    `/api/dishes?${searchParams.toString()}`
  );
  return response.data.data;
};

export const useDishes = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.DISHES, params],
    queryFn: () => fetchDishes(params)
  });
};
