import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deletePostComment = async ({ postId, commentId }) => {
  const response = await apiClient.delete(
    `/api/posts/${postId}/comments/${commentId}`
  );
  return response.data;
};

export const useDeletePostComment = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePostComment,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.POST(variables.postId)
      });

      toast.success(res.message || 'Đã xoá bình luận');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Không thể xoá bình luận');
    }
  });
};
