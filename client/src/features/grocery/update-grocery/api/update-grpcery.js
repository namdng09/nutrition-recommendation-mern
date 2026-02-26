import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateGrocery = async ({ groceryId, data }) => {
  const res = await apiClient.put(`/api/groceries/${groceryId}`, data);
  return res.data;
};

export const useUpdateGrocery = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGrocery,

    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GROCERIES
      });

      toast.success(res.message || 'Đã cập nhật danh sách');
      onSuccess?.(res);
    },

    onError: err => {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  });
};
