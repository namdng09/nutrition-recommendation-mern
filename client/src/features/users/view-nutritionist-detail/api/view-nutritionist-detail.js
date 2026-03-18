import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchNutritionistDetail = async id => {
  const response = await apiClient.get(`/api/users/${id}/profile`);
  return response.data.data;
};

export const useNutritionistDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.NUTRITIONIST(id),
    queryFn: () => fetchNutritionistDetail(id)
  });
};
