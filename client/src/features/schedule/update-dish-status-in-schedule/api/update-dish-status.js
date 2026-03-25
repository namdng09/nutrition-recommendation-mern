import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateDishStatus = async ({ scheduleId, mealType, dishId, isEaten }) => {
  const res = await apiClient.put(
    `/api/schedules/${scheduleId}/meals/${mealType}/dishes/${dishId}/is-eaten`,
    { isEaten }
  );
  return res.data;
};

export const useUpdateDishStatus = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDishStatus,

    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULE(variables.scheduleId)
      });

      toast.success(res.message || 'Đã cập nhật trạng thái món ăn');
      onSuccess?.(res.data);
    },

    onError: err => {
      toast.error(
        err.response?.data?.message || 'Cập nhật trạng thái món ăn thất bại'
      );
    }
  });
};
