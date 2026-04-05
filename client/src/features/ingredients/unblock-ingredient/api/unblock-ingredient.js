import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const unblockIngredient = async ingredientId => {
  const formData = new FormData();
  formData.append('ingredientId', ingredientId);

  const res = await apiClient.delete('/api/users/me/blocks/ingredients', {
    data: formData
  });

  return res.data;
};

export const useUnblockIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unblockIngredient,

    onMutate: async ingredientId => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PROFILE
      });

      const previous = queryClient.getQueryData(QUERY_KEYS.PROFILE);

      queryClient.setQueryData(QUERY_KEYS.PROFILE, old => {
        if (!old) return old;

        return {
          ...old,
          blockIngredients: (old.blockIngredients || []).filter(item => {
            const id = typeof item === 'string' ? item : item?._id;
            return id !== ingredientId;
          })
        };
      });

      return { previous };
    },

    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.PROFILE, context.previous);
      }

      toast.error(err?.response?.data?.message || 'Không thể bỏ chặn');
    },

    onSuccess: res => {
      toast.success(res.message || 'Đã bỏ chặn');
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
    }
  });
};
