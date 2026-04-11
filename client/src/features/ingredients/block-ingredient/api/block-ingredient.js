import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const blockIngredient = async ingredientId => {
  const formData = new FormData();
  formData.append('ingredientId', ingredientId);

  const res = await apiClient.post(
    '/api/users/me/blocks/ingredients',
    formData
  );
  return res.data;
};

export const useBlockIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockIngredient,

    onMutate: async ingredientId => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PROFILE
      });

      const previous = queryClient.getQueryData(QUERY_KEYS.PROFILE);

      queryClient.setQueryData(QUERY_KEYS.PROFILE, old => {
        if (!old) return old;

        const current = old.blockIngredients || [];
        const currentIds = current.map(item =>
          typeof item === 'string' ? item : item?._id
        );

        if (currentIds.includes(ingredientId)) return old;

        return {
          ...old,
          blockIngredients: [...current, ingredientId]
        };
      });

      return { previous };
    },

    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.PROFILE, context.previous);
      }

      toast.error(err?.response?.data?.message || 'Không thể chặn nguyên liệu');
    },

    onSuccess: res => {
      toast.success(res.message || 'Đã chặn nguyên liệu');
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
    }
  });
};
