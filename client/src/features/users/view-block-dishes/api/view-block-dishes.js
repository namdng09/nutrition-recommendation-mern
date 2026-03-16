import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

// GET block dishes with full details
const getBlockDishes = async () => {
  const response = await apiClient.get('/api/users/me');

  return response.data.data.blockDishes || [];
};

// Hook
export const useBlockDishes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE, 'blockDishes'],
    queryFn: getBlockDishes,
    select: data => {
      return data;
    }
  });
};
