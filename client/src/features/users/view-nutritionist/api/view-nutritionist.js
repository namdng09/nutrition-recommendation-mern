import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const emptyNutritionistsPayload = params => ({
  docs: [],
  totalDocs: 0,
  limit: Number(params?.limit) || 0,
  page: Number(params?.page) || 1,
  totalPages: 0,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null
});

const fetchNutritionists = async params => {
  try {
    const searchParams = buildQueryParams(params, ['name']);
    const response = await apiClient.get(
      `/api/users/nutritionists?${searchParams.toString()}`
    );

    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return emptyNutritionistsPayload(params);
    }
    throw error;
  }
};

export const useNutritionists = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.NUTRITIONISTS, params],
    queryFn: () => fetchNutritionists(params)
  });
};
