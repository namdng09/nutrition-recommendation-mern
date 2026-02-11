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
    onSuccess: res => {
      toast.success(res.message || 'Đã bỏ chặn');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
    },
    onError: () => {
      toast.error('Không thể bỏ chặn');
    }
  });
};
