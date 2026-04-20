import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deletePrivateDish = async ({ id }) => {
  const res = await apiClient.delete(`/api/dishes/private/${id}/`, {
    headers: { 'Content-Type': 'application/json' }
  });

  return res.data;
};

export const useDeletePrivateDish = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePrivateDish,
    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DISHES
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRIVATE_DISHES
      });

      toast.success(res.message || 'Xoá món ăn của riêng bạn thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(
        err.response?.data?.message || 'Xoá món ăn của riêng bạn thất bại'
      );
    }
  });
};
