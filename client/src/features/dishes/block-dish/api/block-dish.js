import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const blockDish = async dishId => {
  const formData = new FormData();
  formData.append('dishId', dishId);
  const response = await apiClient.post(
    '/api/users/me/blocks/dishes',
    formData
  );
  return response.data;
};

export const useBlockDish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockDish,

    onMutate: async dishId => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PROFILE });
      const previous = queryClient.getQueryData(QUERY_KEYS.PROFILE);
      queryClient.setQueryData(QUERY_KEYS.PROFILE, old => {
        if (!old) return old;

        return {
          ...old,
          blockDishes: [...(old.blockDishes || []), dishId]
        };
      });
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.PROFILE, context.previous);
      }
      toast.error('Không thể chặn món ăn');
    },
    onSuccess: res => {
      toast.success(res.message || 'Đã chặn món ăn');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
    }
  });
};
