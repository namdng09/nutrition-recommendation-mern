import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchReviewDetail = async dishId => {
  const response = await apiClient.get(`/api/reviews/${dishId}`);
  return response.data.data;
};

export const useNutritionistReviewDetail = (dishId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEW(dishId),
    queryFn: () => fetchReviewDetail(dishId),
    enabled: !!dishId,
    ...options
  });
};
