import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

// DELETE remove favorite dish
const removeFavoriteDish = async dishId => {
  const response = await apiClient.delete('/api/users/me/favorites/dishes', {
    data: { dishId }
  });
  return response.data;
};

// Hook for Remove only
export const useRemoveFavoriteDish = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFavoriteDish,
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROFILE]
      });
      onSuccess?.(response);
    },
    onError
  });
};
