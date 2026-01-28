import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchDishesDetail = async id => {
  const response = await apiClient.get(`/api/dishes/${id}`);
  return response.data.data;
};

export const useDishesDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.DISH(id),
    queryFn: () => fetchDishesDetail(id)
  });
};
