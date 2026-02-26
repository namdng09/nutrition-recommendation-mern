import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const removeBlockIngredient = async ingredientId => {
  const response = await apiClient.delete('/api/users/me/blocks/ingredients', {
    data: { ingredientId }
  });
  return response.data;
};

export const useRemoveBlockIngredient = options => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeBlockIngredient,
    onMutate: async ingredientId => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.PROFILE, 'blockIngredients']
      });

      // Snapshot previous value
      const previousIngredients = queryClient.getQueryData([
        QUERY_KEYS.PROFILE,
        'blockIngredients'
      ]);

      // Optimistically update
      queryClient.setQueryData(
        [QUERY_KEYS.PROFILE, 'blockIngredients'],
        old => old?.filter(ingredient => ingredient._id !== ingredientId) || []
      );

      return { previousIngredients };
    },
    onError: (err, ingredientId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        [QUERY_KEYS.PROFILE, 'blockIngredients'],
        context.previousIngredients
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROFILE, 'blockIngredients']
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
    },
    ...options
  });
};
