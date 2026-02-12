import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteGrocery = async ({ groceryId }) => {
  const response = await apiClient.delete(`/api/groceries/${groceryId}`);
  return response.data;
};

export const useDeleteGrocery = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGrocery,

    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GROCERIES
      });

      toast.success(data?.message || 'Xoá danh sách mua sắm thành công');

      onSuccess?.();
    },

    onError: error => {
      toast.error(
        error.response?.data?.message || 'Xoá danh sách mua sắm thất bại'
      );
    }
  });
};
