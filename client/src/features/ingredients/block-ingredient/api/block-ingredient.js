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
    onSuccess: res => {
      toast.success(res.message || 'Đã chặn nguyên liệu');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
    },
    onError: () => {
      toast.error('Không thể chặn nguyên liệu');
    }
  });
};
