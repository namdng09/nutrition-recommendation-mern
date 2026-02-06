import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createSchedule = async ({ date, dayOfWeek }) => {
  const formData = new FormData();
  formData.append('date', date);
  formData.append('dayOfWeek', dayOfWeek);

  const response = await apiClient.post('/api/schedules', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const useCreateSchedule = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });
      toast.success(res.message || 'Schedule created successfully');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Failed to create schedule');
    }
  });
};
