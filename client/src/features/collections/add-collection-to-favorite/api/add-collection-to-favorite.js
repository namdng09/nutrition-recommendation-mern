import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const addCollectionToFavorite = async collectionId => {
  const response = await apiClient.post('/api/users/me/favorites/collections', {
    collectionId
  });
  return response.data;
};

export const useAddCollectionToFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCollectionToFavorite,

    onMutate: async collectionId => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PROFILE
      });

      const previous = queryClient.getQueryData(QUERY_KEYS.PROFILE);

      queryClient.setQueryData(QUERY_KEYS.PROFILE, old => {
        if (!old) return old;

        const current = old.favoriteCollections || [];
        const currentIds = current.map(item =>
          typeof item === 'string' ? item : item?._id
        );

        if (currentIds.includes(collectionId)) return old;

        return {
          ...old,
          favoriteCollections: [...current, collectionId]
        };
      });

      return { previous };
    },

    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.PROFILE, context.previous);
      }

      toast.error(
        err.response?.data?.message || 'Không thể thêm vào yêu thích'
      );
    },

    onSuccess: res => {
      toast.success(res.message || 'Đã thêm vào yêu thích');
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
    }
  });
};
