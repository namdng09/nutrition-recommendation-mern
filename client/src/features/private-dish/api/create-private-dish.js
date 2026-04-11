import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createPrivateDish = async dishData => {
  const response = await apiClient.post('/api/dishes/private', {
    ...dishData,
    isPublic: false
  });

  return response.data;
};

export const useCreatePrivateDish = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrivateDish,
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRIVATE_DISHES });

      toast.success(res.message || 'Tạo món ăn riêng thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Tạo món ăn riêng thất bại');
    }
  });
};
