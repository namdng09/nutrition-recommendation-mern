import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const getBlockIngredients = async () => {
  const response = await apiClient.get('/api/users/me');

  return response.data.data.blockIngredients || [];
};

// Hook
export const useBlockIngredients = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE, 'blockIngredients'],
    queryFn: getBlockIngredients,
    select: data => {
      return data;
    }
  });
};
