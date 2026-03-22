import { useEffect, useState } from 'react';

import {
  useUpdateExerciseWorkout,
  WORKOUT_COUNTER_TYPE
} from '../api/update-exercise-workout';
import EditWorkoutFormFields from './edit-workout-form-fields';

export default function EditWorkoutModal({
  open,
  onClose,
  scheduleId,
  workout
}) {
  const { mutate: updateExercise, isPending } = useUpdateExerciseWorkout({
    onSuccess: () => {
      onClose?.();
    }
  });

  const [form, setForm] = useState({
    weight: '',
    reps: '',
    sets: '',
    value: '',
    unit: 'km',
    seconds: ''
  });

  useEffect(() => {
    if (!workout) return;

    setForm({
      weight: workout.weightAndRepsTarget?.weight ?? '',
      reps: workout.weightAndRepsTarget?.reps ?? '',
      sets: workout.weightAndRepsTarget?.sets ?? '',
      value: workout.distanceTarget?.value ?? '',
      unit: workout.distanceTarget?.unit ?? 'km',
      seconds: workout.durationTarget?.seconds ?? ''
    });
  }, [workout]);

  if (!open || !workout) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    const payload = {
      logType: workout.logType,
      isCompleted: workout.isCompleted
    };

    if (workout.logType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS) {
      payload.weightAndRepsTarget = {
        weight: form.weight === '' ? undefined : Number(form.weight),
        reps: Number(form.reps),
        sets: Number(form.sets)
      };
    }

    if (workout.logType === WORKOUT_COUNTER_TYPE.DISTANCE) {
      payload.distanceTarget = {
        value: Number(form.value),
        unit: form.unit
      };
    }

    if (workout.logType === WORKOUT_COUNTER_TYPE.DURATION) {
      payload.durationTarget = {
        seconds: Number(form.seconds)
      };
    }

    updateExercise({
      scheduleId,
      exerciseId: workout.exerciseId,
      workout: payload
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]'>
      <div className='w-full max-w-lg overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl'>
        <div className='border-b border-border/60 px-6 py-5'>
          <h3 className='text-xl font-black tracking-tight text-foreground'>
            Chỉnh sửa bài tập
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            {workout.exerciseName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5 px-6 py-6'>
          <EditWorkoutFormFields
            workout={workout}
            form={form}
            onChange={handleChange}
          />

          <div className='flex items-center justify-end gap-3 border-t border-border/60 pt-5'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted'
            >
              Huỷ
            </button>

            <button
              type='submit'
              disabled={isPending}
              className='inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
