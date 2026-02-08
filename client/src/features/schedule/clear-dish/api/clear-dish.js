import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const clearMealDishes = async ({ scheduleId, mealType }) => {
  const response = await apiClient.delete(
    `/api/schedules/${scheduleId}/meals/${mealType}/dishes`
  );
  return response.data;
};

export const useClearMealDishes = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearMealDishes,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHEDULES });
      toast.success(data?.message || 'Xoá toàn bộ món ăn của bữa thành công');
      onSuccess?.();
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Xoá toàn bộ món ăn của bữa thất bại'
      );
    }
  });
};
