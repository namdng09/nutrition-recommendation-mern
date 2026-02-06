import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchDishNutritionDetail = async id => {
  const response = await apiClient.get(`/api/dishes/${id}/detail-nutrition`);
  return response.data.data;
};

export const useDishNutritionDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.DISH_NUTRITION_DETAIL(id),
    queryFn: () => fetchDishNutritionDetail(id)
  });
};
