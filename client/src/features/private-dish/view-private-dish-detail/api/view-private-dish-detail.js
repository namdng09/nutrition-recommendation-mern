import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchPrivateDishDetail = async id => {
  const response = await apiClient.get(`/api/dishes/private/${id}`);
  return response.data.data;
};

export const usePrivateDishDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.PRIVATE_DISH(id),
    queryFn: () => fetchPrivateDishDetail(id),
    enabled: !!id
  });
};
