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

    onMutate: async postId => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.POST(postId)
      });

      const previousPost = queryClient.getQueryData(QUERY_KEYS.POST(postId));
      const profile = queryClient.getQueryData(QUERY_KEYS.PROFILE);
      const currentUserId = profile?._id;

      queryClient.setQueryData(QUERY_KEYS.POST(postId), old => {
        if (!old || !currentUserId) return old;

        const currentLikes = old.likes || [];
        const likeIds = currentLikes.map(item =>
          typeof item === 'string' ? item : item?._id
        );

        const hasLiked = likeIds.includes(currentUserId);

        return {
          ...old,
          likes: hasLiked
            ? currentLikes.filter(item => {
                const id = typeof item === 'string' ? item : item?._id;
                return id !== currentUserId;
              })
            : [...currentLikes, currentUserId]
        };
      });

      return { previousPost, postId };
    },

    onError: (err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          QUERY_KEYS.POST(context.postId),
          context.previousPost
        );
      }

      toast.error(
        err.response?.data?.message || 'Không thể cập nhật lượt thích'
      );
    },

    onSuccess: (res, postId) => {
      toast.success(res.message || 'Cập nhật lượt thích thành công');
      onSuccess?.(res.data);
    },

    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.POST(postId)
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROFILE
      });
    }
  });
};
