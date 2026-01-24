import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchUsers = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const response = await apiClient.get(`/api/users?${searchParams.toString()}`);
  return response.data.data;
};

export const useUsers = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: () => fetchUsers(params)
  });
};
