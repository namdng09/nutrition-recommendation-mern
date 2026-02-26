import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const removeBlockDish = async dishId => {
  const response = await apiClient.delete('/api/users/me/blocks/dishes', {
    data: { dishId }
  });
  return response.data;
};

export const useRemoveBlockDish = options => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeBlockDish,
    onMutate: async dishId => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.PROFILE, 'blockDishes']
      });

      // Snapshot previous value
      const previousDishes = queryClient.getQueryData([
        QUERY_KEYS.PROFILE,
        'blockDishes'
      ]);

      // Optimistically update
      queryClient.setQueryData(
        [QUERY_KEYS.PROFILE, 'blockDishes'],
        old => old?.filter(dish => dish._id !== dishId) || []
      );

      return { previousDishes };
    },
    onError: (err, dishId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        [QUERY_KEYS.PROFILE, 'blockDishes'],
        context.previousDishes
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROFILE, 'blockDishes']
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
    },
    ...options
  });
};
