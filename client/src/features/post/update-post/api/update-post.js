import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

export const useUpdatePost = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, images }) => {
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('category', data.category);
      formData.append('isPublished', data.isPublished);

      if (data.tags && data.tags.length > 0) {
        formData.append(
          'tags',
          JSON.stringify(data.tags.filter(tag => tag.trim()))
        );
      }

      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await apiClient.put(`/api/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST_DETAIL });
      toast.success(data.message || 'Cập nhật bài viết thành công');
      onSuccess?.(data);
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Cập nhật bài viết thất bại'
      );
      onError?.(error);
    }
  });
};
