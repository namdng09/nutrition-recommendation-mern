import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const evaluateReview = async ({ dishId, rating, feedback }) => {
  const response = await apiClient.post(
    `/api/reviews/${dishId}/evaluate`,
    {
      rating,
      feedback
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

export const useEvaluateReview = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluateReview,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS });

      if (variables?.dishId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEW(variables.dishId)
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PRIVATE_DISH(variables.dishId)
        });
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRIVATE_DISHES });

      toast.success(res.message || 'Đánh giá món ăn thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(
        err.response?.data?.message ||
          'Đánh giá món ăn thất bại, vui lòng thử lại'
      );
    }
  });
};
