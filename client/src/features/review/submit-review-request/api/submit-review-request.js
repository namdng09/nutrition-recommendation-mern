import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const submitReviewRequest = async ({ dishId }) => {
  const response = await apiClient.post(
    '/api/reviews',
    { dishId },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

export const useSubmitReviewRequest = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitReviewRequest,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRIVATE_DISHES });

      if (variables?.dishId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PRIVATE_DISH(variables.dishId)
        });
      }

      toast.success(
        res.message || 'Gửi yêu cầu duyệt món ăn cho chuyên gia thành công'
      );
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(
        err.response?.data?.message ||
          'Gửi yêu cầu duyệt món ăn cho chuyên gia thất bại'
      );
    }
  });
};
