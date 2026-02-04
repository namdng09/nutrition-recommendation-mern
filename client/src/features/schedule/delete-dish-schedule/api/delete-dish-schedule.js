import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteDishSchedule = async ({ scheduleId, mealType, dishId }) => {
  const response = await apiClient.delete(
    `/api/schedules/${scheduleId}/meals/${mealType}/dishes/${dishId}`
  );
  return response.data;
};

export const useDeleteDishSchedule = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDishSchedule,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHEDULES });
      toast.success(data?.message || 'Xoá món ăn thành công');
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xoá món ăn thất bại');
    }
  });
};
