import apiClient from '~/lib/api-client';
import { queryClient } from '~/lib/query-client';
import { QUERY_KEYS } from '~/lib/query-keys';

export const logout = async () => {
  const response = await apiClient.post('/api/auth/logout');
  queryClient.removeQueries({ queryKey: QUERY_KEYS.PROFILE });
  return response.data;
};
