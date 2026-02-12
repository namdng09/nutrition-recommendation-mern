import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

// DELETE remove favorite ingredient
const removeFavoriteIngredient = async ingredientId => {
  const response = await apiClient.delete(
    '/api/users/me/favorites/ingredients',
    {
      data: { ingredientId }
    }
  );
  return response.data;
};

// Hook for Remove
export const useRemoveFavoriteIngredient = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFavoriteIngredient,
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROFILE]
      });
      onSuccess?.(response);
    },
    onError
  });
};
