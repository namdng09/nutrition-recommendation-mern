import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async postId => {
      await apiClient.delete(`/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
      toast.success('Xóa bài viết thành công');
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa bài viết thất bại');
    }
  });
};

export const useDeleteBulkPosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async postIds => {
      await Promise.all(
        postIds.map(id => apiClient.delete(`/api/posts/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
      toast.success('Xóa nhiều bài viết thành công');
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa bài viết thất bại');
    }
  });
};
