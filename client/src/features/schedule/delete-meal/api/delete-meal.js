import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteScheduleMeal = async ({ scheduleId, mealType }) => {
  const response = await apiClient.delete(
    `/api/schedules/${scheduleId}/meals/${mealType}`
  );
  return response.data;
};

export const useDeleteScheduleMeal = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScheduleMeal,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULE(variables.scheduleId)
      });

      toast.success(data?.message || 'Xoá bữa ăn thành công');
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xoá bữa ăn thất bại');
    }
  });
};
