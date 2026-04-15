import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchNutritionistReviews = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const queryString = searchParams.toString();
  const url = queryString ? `/api/reviews?${queryString}` : '/api/reviews';

  const response = await apiClient.get(url);
  return response.data.data;
};

export const useNutritionistReviews = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.REVIEWS, params],
    queryFn: () => fetchNutritionistReviews(params),
    ...options
  });
};
