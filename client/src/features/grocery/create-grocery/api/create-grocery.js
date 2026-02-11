import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createGrocery = async ({ name, date }) => {
  const payload = {
    name,
    date: (date ?? []).map(d =>
      typeof d === 'string' ? d : d.toISOString().split('T')[0]
    )
  };
  const response = await apiClient.post('/api/groceries', payload);
  return response.data;
};

export const useCreateGrocery = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGrocery,

    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GROCERIES
      });

      toast.success(res.message || 'Đã tạo danh sách mua sắm');
      onSuccess?.(res.data);
    },

    onError: err => {
      toast.error(err.response?.data?.message || 'Tạo danh sách thất bại');
    }
  });
};
