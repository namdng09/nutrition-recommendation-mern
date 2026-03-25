import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteExerciseWorkout = async ({ scheduleId, exerciseId }) => {
  const res = await apiClient.delete(
    `/api/schedules/${scheduleId}/workout/exercises/${exerciseId}`,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );

  return res.data;
};

export const useDeleteExerciseWorkout = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExerciseWorkout,
    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      toast.success(res.message || 'Xoá bài tập thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Xoá bài tập thất bại');
    }
  });
};
