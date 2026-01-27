import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchUserDetail = async id => {
  const response = await apiClient.get(`/api/users/${id}`);
  return response.data.data;
};

export const useUserDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn: () => fetchUserDetail(id)
  });
};
