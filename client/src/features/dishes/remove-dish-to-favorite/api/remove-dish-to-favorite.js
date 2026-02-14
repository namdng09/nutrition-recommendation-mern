import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const removeDishFromFavorite = async dishId => {
  const formData = new FormData();
  formData.append('dishId', dishId);
  const response = await apiClient.delete('/api/users/me/favorites/dishes', {
    data: formData
  });
  return response.data;
};

export const useRemoveDishFromFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeDishFromFavorite,

    onMutate: async dishId => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
      const previous = queryClient.getQueryData(QUERY_KEYS.PROFILE);
      queryClient.setQueryData(QUERY_KEYS.PROFILE, old => {
        if (!old) return old;

        return {
          ...old,
          favoriteDishes: old.favoriteDishes?.filter(id => id !== dishId)
        };
      });
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.PROFILE, context.previous);
      }
      toast.error('Không thể xoá yêu thích');
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
