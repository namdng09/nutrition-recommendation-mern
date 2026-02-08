import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteSchedule = async scheduleId => {
  const response = await apiClient.delete(`/api/schedules/${scheduleId}`);
  return response.data;
};

export const useDeleteSchedule = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHEDULES });
      toast.success(data?.message || 'Xoá lịch thành công');
      onSuccess?.(data);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xoá lịch thất bại');
    }
  });
};
