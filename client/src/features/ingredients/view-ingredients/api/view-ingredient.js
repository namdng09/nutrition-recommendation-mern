import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchIngredients = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const response = await apiClient.get(
    `/api/ingredients?${searchParams.toString()}`
  );
  return response.data.data;
};

export const useIngredients = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.INGREDIENTS, params],
    queryFn: () => fetchIngredients(params)
  });
};
