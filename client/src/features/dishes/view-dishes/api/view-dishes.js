import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const getDishes = async params => {
  const response = await apiClient.get('/api/dishes', { params });
  return response.data.data;
};

export const useDishes = params => {
  return useQuery({
    queryKey: [QUERY_KEYS.DISHES, params],
    queryFn: () => getDishes(params),
    staleTime: 5 * 60 * 1000
  });
};

const getDishDetail = async id => {
  const response = await apiClient.get(`/api/dishes/${id}`);
  return response.data.data;
};

export const useDishDetail = id => {
  return useQuery({
    queryKey: [QUERY_KEYS.DISH(id)],
    queryFn: () => getDishDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
};
