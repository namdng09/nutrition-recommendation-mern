import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const removeCollectionFromFavorite = async collectionId => {
  const response = await apiClient.delete(
    '/api/users/me/favorites/collections',
    {
      data: { collectionId }
    }
  );
  return response.data;
};

export const useRemoveCollectionFromFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCollectionFromFavorite,

    onMutate: async collectionId => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
      const previous = queryClient.getQueryData(QUERY_KEYS.PROFILE);

      queryClient.setQueryData(QUERY_KEYS.PROFILE, old => {
        if (!old) return old;

        return {
          ...old,
          favoriteCollections:
            old.favoriteCollections?.filter(id => id !== collectionId) || []
        };
      });

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.PROFILE, context.previous);
      }
      toast.error('Không thể xoá khỏi yêu thích');
    },
    onSuccess: res => {
      toast.success(res.message || 'Đã xoá khỏi yêu thích');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
    }
  });
};
