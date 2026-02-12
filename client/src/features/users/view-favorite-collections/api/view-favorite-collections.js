import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

// GET favorite collections with full details
const getFavoriteCollections = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data.data.favoriteCollections || [];
};

// Hook
export const useFavoriteCollections = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE, 'favoriteCollections'],
    queryFn: getFavoriteCollections,
    select: data => data
  });
};
