import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateGroceryIngredient = async ({
  groceryId,
  ingredientId,
  isPurchased
}) => {
  const res = await apiClient.put(
    `/api/groceries/${groceryId}/ingredients/${ingredientId}`,
    {
      isPurchased
    }
  );
  return res.data;
};

export const useUpdateGroceryIngredient = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGroceryIngredient,

    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GROCERIES
      });

      toast.success(data?.message || 'Đã cập nhật nguyên liệu');
      onSuccess?.(data);
    },

    onError: err => {
      toast.error(
        err.response?.data?.message || 'Cập nhật nguyên liệu thất bại'
      );
    }
  });
};
