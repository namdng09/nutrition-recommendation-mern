import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

// GET favorite ingredients with full details
const getFavoriteIngredients = async () => {
  const response = await apiClient.get('/api/users/me');

  // ✅ DEBUG: Check response
  console.log('📡 API Response:', response.data);

  return response.data.data.favoriteIngredients || [];
};

// Hook
export const useFavoriteIngredients = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE, 'favoriteIngredients'],
    queryFn: getFavoriteIngredients,
    select: data => {
      // ✅ DEBUG: Check selected data
      console.log('✅ Selected Data:', data);
      return data;
    }
  });
};
