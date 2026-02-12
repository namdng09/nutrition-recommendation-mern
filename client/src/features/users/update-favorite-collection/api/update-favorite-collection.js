import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

// DELETE remove favorite collection
const removeFavoriteCollection = async collectionId => {
  const response = await apiClient.delete(
    '/api/users/me/favorites/collections',
    {
      data: { collectionId }
    }
  );
  return response.data;
};

// Hook for Remove only
export const useRemoveFavoriteCollection = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFavoriteCollection,
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROFILE]
      });
      onSuccess?.(response);
    },
    onError
  });
};
