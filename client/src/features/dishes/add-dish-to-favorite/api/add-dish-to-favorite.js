import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const addDishToFavorite = async dishId => {
  const response = await apiClient.post('/api/users/me/favorites/dishes', {
    dishId
  });
  return response.data;
};

export const useAddDishToFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDishToFavorite,

    onMutate: async dishId => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
      const previous = queryClient.getQueryData(QUERY_KEYS.PROFILE);
      queryClient.setQueryData(QUERY_KEYS.PROFILE, old => {
        if (!old) return old;

        return {
          ...old,
          favoriteDishes: [...(old.favoriteDishes || []), dishId]
        };
      });
      return { previous };
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.PROFILE, context.previous);
      }
      toast.error(
        err.response?.data?.message || 'Không thể thêm món yêu thích'
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
