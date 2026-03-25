import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

export const WORKOUT_COUNTER_TYPE = {
  DISTANCE: 'Quãng đường',
  WEIGHT_AND_REPS: 'Cân nặng và số lần tập',
  DURATION: 'Thời gian'
};

const buildWorkoutPayload = workout => {
  const payload = {
    exerciseId: workout.exerciseId,
    logType: workout.logType
  };

  if (workout.logType === WORKOUT_COUNTER_TYPE.DISTANCE) {
    payload.distanceTarget = {
      value: Number(workout.distanceTarget?.value || 0),
      unit: workout.distanceTarget?.unit
    };
  }

  if (workout.logType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS) {
    payload.weightAndRepsTarget = {
      weight:
        workout.weightAndRepsTarget?.weight !== undefined &&
        workout.weightAndRepsTarget?.weight !== ''
          ? Number(workout.weightAndRepsTarget.weight)
          : undefined,
      reps: Number(workout.weightAndRepsTarget?.reps || 0),
      sets: Number(workout.weightAndRepsTarget?.sets || 1)
    };
  }

  if (workout.logType === WORKOUT_COUNTER_TYPE.DURATION) {
    payload.durationTarget = {
      seconds: Number(workout.durationTarget?.seconds || 0)
    };
  }

  return payload;
};

const addExerciseWorkout = async ({ scheduleId, workout }) => {
  const body = buildWorkoutPayload(workout);

  const res = await apiClient.post(
    `/api/schedules/${scheduleId}/workout/exercises`,
    body,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );

  return res.data;
};

export const useAddExerciseWorkout = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExerciseWorkout,
    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SCHEDULES
      });

      toast.success(res.message || 'Thêm bài tập thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Thêm bài tập thất bại');
    }
  });
};
