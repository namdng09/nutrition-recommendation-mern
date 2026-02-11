import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteGroceryIngredient = async ({ groceryId, ingredientId }) => {
  const response = await apiClient.delete(
    `/api/groceries/${groceryId}/ingredients`,
    {
      data: {
        ingredients: [ingredientId]
      }
    }
  );
  return response.data;
};

export const useDeleteGroceryIngredient = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroceryIngredient,

    onSuccess: data => {
      queryClient.refetchQueries({
        queryKey: QUERY_KEYS.GROCERIES
      });
      toast.success(data?.message || 'Đã xoá nguyên liệu');
      onSuccess?.(data);
    },

    onError: error => {
      toast.error(error.response?.data?.message || 'Xoá nguyên liệu thất bại');
    }
  });
};
