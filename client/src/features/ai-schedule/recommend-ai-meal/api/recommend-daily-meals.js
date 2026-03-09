import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const recommendDailyMeals = async ({ date }) => {
  const response = await apiClient.post('/api/ai/recommend-daily-meals', {
    date
  });

  return response.data;
};

export const useRecommendDailyMeals = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recommendDailyMeals,

    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      toast.success(res.message || 'Tạo thực đơn hằng ngày bằng AI thành công');
      onSuccess?.(res.data);
    },

    onError: err => {
      toast.error(
        err.response?.data?.message ||
          'Không thể tạo thực đơn hằng ngày bằng AI'
      );
    }
  });
};
