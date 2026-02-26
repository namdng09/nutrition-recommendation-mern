import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const addGroceryIngredient = async ({ groceryId, ingredients }) => {
  const res = await apiClient.put(`/api/groceries/${groceryId}/ingredients`, {
    ingredients
  });
  return res.data;
};

export const useAddGroceryIngredient = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGroceryIngredient,

    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GROCERIES
      });

      toast.success(res.message || 'Đã thêm nguyên liệu');
      onSuccess?.(res.data);
    },

    onError: err => {
      toast.error(err.response?.data?.message || 'Thêm nguyên liệu thất bại');
    }
  });
};
