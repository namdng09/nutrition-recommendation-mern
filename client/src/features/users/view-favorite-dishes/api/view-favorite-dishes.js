import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

// GET favorite dishes with full details
const getFavoriteDishes = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data.data.favoriteDishes || [];
};

// Hook
export const useFavoriteDishes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE, 'favoriteDishes'],
    queryFn: getFavoriteDishes,
    select: data => data
  });
};
