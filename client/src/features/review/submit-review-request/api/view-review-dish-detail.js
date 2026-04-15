import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchReviewDishDetail = async dishId => {
  const response = await apiClient.get(`/api/dishes/${dishId}`);
  return response.data.data;
};

export const useNutritionistReviewDishDetail = (dishId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.DISH(dishId),
    queryFn: () => fetchReviewDishDetail(dishId),
    enabled: !!dishId,
    ...options
  });
};
