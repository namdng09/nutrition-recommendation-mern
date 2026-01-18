import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchProfile = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data.data;
};

export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: fetchProfile
  });
};
