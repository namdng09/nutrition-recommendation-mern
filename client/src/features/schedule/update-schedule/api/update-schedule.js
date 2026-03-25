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
    onSuccess: (res, variables) => {
      const updatedSchedule = res?.data;

      if (updatedSchedule?._id) {
        queryClient.setQueryData(
          QUERY_KEYS.SCHEDULE(updatedSchedule._id),
          updatedSchedule
        );
      }

      queryClient.setQueriesData({ queryKey: QUERY_KEYS.SCHEDULES }, old => {
        if (!old) return old;

        if (Array.isArray(old)) {
          return old.map(item =>
            item?._id === variables.scheduleId
              ? { ...item, ...updatedSchedule }
              : item
          );
        }

        const oldDocs = Array.isArray(old?.docs) ? old.docs : [];

        return {
          ...old,
          docs: oldDocs.map(item =>
            item?._id === variables.scheduleId
              ? { ...item, ...updatedSchedule }
              : item
          )
        };
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULE(variables.scheduleId)
      });

      toast.success(res.message || 'Cập nhật bữa ăn thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Cập nhật bữa ăn thất bại');
    }
  });
};
