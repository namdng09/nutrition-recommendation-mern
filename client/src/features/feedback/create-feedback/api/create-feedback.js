import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createFeedback = async ({ type, content }) => {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('content', content);

  const response = await apiClient.post('/api/feedback/', formData);
  return response.data;
};

export const useCreateFeedback = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeedback,
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEEDBACKS });
      toast.success(res.message || 'Gửi feedback thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Gửi feedback thất bại');
    }
  });
};
