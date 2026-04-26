import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const addPostComment = async ({ postId, content }) => {
  const formData = new FormData();
  formData.append('content', content);

  const response = await apiClient.post(
    `/api/posts/${postId}/comments`,
    formData
  );

  return response.data;
};

export const useAddPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPostComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.POST(variables.postId)
      });

      toast.success('Đã thêm bình luận');
    },
    onError: error => {
      if (error?.response?.status === 401) {
        toast.error('Bạn cần đăng nhập để bình luận');
        return;
      }

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Thêm bình luận thất bại'
      );
    }
  });
};
