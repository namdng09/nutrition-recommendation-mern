import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const recommendDailyWorkout = async ({ date, maxExercises }) => {
  const body = { date };

  if (maxExercises) {
    body.maxExercises = Number(maxExercises);
  }

  const response = await apiClient.post(
    '/api/ai/recommend-daily-workout',
    body,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );

  return response.data;
};

export const useRecommendDailyWorkout = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recommendDailyWorkout,

    onSuccess: res => {
      const nextSchedule = res?.data?.schedule;

      if (nextSchedule?._id) {
        queryClient.setQueriesData({ queryKey: QUERY_KEYS.SCHEDULES }, old => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.map(item =>
              item?._id === nextSchedule._id
                ? {
                    ...item,
                    ...nextSchedule
                  }
                : item
            );
          }

          const oldDocs = Array.isArray(old?.docs) ? old.docs : [];

          return {
            ...old,
            docs: oldDocs.map(item =>
              item?._id === nextSchedule._id
                ? {
                    ...item,
                    ...nextSchedule
                  }
                : item
            )
          };
        });

        queryClient.setQueryData(QUERY_KEYS.SCHEDULE(nextSchedule._id), old => {
          if (!old) return nextSchedule;

          return {
            ...old,
            ...nextSchedule
          };
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SCHEDULES
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SCHEDULE(nextSchedule._id)
        });
      }

      toast.success(res?.message || 'Tạo gợi ý bài tập thành công');
      onSuccess?.(res.data);
    },

    onError: err => {
      toast.error(
        err?.response?.data?.message || 'Không thể tạo gợi ý bài tập'
      );
    }
  });
};
