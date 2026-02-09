import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

export const useCreatePost = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, images }) => {
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

      const response = await apiClient.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
      toast.success(data.message || 'Tạo bài viết thành công');
      onSuccess?.(data);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Tạo bài viết thất bại');
      onError?.(error);
    }
  });
};
