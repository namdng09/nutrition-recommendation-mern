import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const addIngredientToFavorite = async ingredientId => {
  const response = await apiClient.post('/api/users/me/favorites/ingredients', {
    ingredientId
  });
  return response.data;
};

export const useAddIngredientToFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addIngredientToFavorite,

    onMutate: async ingredientId => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PROFILE
      });

      const previousProfile = queryClient.getQueryData(QUERY_KEYS.PROFILE);

      queryClient.setQueryData(QUERY_KEYS.PROFILE, old => {
        if (!old) return old;

        const current = old.favoriteIngredients || [];
        const currentIds = current.map(item =>
          typeof item === 'string' ? item : item?._id
        );

        if (currentIds.includes(ingredientId)) return old;

        return {
          ...old,
          favoriteIngredients: [...current, ingredientId]
        };
      });

      return { previousProfile };
    },

    onError: (err, _, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(QUERY_KEYS.PROFILE, context.previousProfile);
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
