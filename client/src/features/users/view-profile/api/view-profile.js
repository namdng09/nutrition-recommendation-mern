import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import apiClient from '~/lib/api-client';
import { getStoredAccessToken } from '~/lib/auth-tokens';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchProfile = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data.data;
};

export const useProfile = () => {
  const user = useSelector(state => state.auth.user);

  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: fetchProfile,
    enabled: !!user && !!getStoredAccessToken(),
    retry: false
  });
};

export const useProfileForPage = () => {
  const user = useSelector(state => state.auth.user);

  return useSuspenseQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: fetchProfile,
    enabled: !!user && !!getStoredAccessToken(),
    retry: false
  });
};
