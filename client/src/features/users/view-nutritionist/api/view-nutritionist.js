import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchNutritionists = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const response = await apiClient.get(
    `/api/users/nutritionists?${searchParams.toString()}`
  );
  return response.data.data;
};

export const useNutritionists = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.NUTRITIONISTS, params],
    queryFn: () => fetchNutritionists(params)
  });
};
