import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchProfile = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data.data;
};

export const useProfile = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: fetchProfile,
    enabled: isAuthenticated
  });
};

export const useProfileForPage = () => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: fetchProfile
  });
};
