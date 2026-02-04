import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const togglePostLike = async postId => {
  const response = await apiClient.post(`/api/posts/${postId}/like`);
  return response.data;
};

export const useTogglePostLike = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    onSuccess: (res, postId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.POST(postId)
      });

      toast.success(res.message || 'Cập nhật lượt thích thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(
        err.response?.data?.message || 'Không thể cập nhật lượt thích'
      );
    }
  });
};
