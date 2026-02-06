import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateScheduleMeals = async ({ scheduleId, meals }) => {
  const res = await apiClient.put(
    `/api/schedules/${scheduleId}/meals`,
    { meals },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
  return res.data;
};

export const useUpdateScheduleMeals = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScheduleMeals,
    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });
      toast.success(res.message || 'Cập nhật bữa ăn thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Cập nhật bữa ăn thất bại');
    }
  });
};
