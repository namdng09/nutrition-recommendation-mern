import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useExercises } from '~/features/exercise/view-exercise/api/view-exercise';

import {
  useAddExerciseWorkout,
  WORKOUT_COUNTER_TYPE
} from '../api/add-exercise-workout';
import ExerciseSelectorSection from './exercise-selector-section';
import SelectedExerciseSummary from './selector-exercise-summary';
import WorkoutTargetFields from './workout-target-fields';

const INITIAL_FORM = {
  exerciseId: '',
  weight: '',
  reps: '',
  sets: '',
  value: '',
  unit: 'km',
  seconds: ''
};

export default function AddWorkoutModal({ open, onClose, scheduleId }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isExerciseListOpen, setIsExerciseListOpen] = useState(false);

  const { data: exercisesData } = useExercises({
    page: 1,
    limit: 1000,
    isActive: true
  });

  const exercises = Array.isArray(exercisesData?.docs)
    ? exercisesData.docs
    : Array.isArray(exercisesData)
      ? exercisesData
      : [];

  const selectedExercise = useMemo(() => {
    return exercises.find(
      exercise => String(exercise._id) === String(form.exerciseId)
    );
  }, [exercises, form.exerciseId]);

  const selectedLogType = selectedExercise?.logType || '';

  const { mutate: addExerciseWorkout, isPending } = useAddExerciseWorkout({
    onSuccess: () => {
      handleClose();
    }
  });

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setIsExerciseListOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!selectedExercise) return;

    setForm(prev => ({
      ...prev,
      weight: '',
      reps: '',
      sets: '',
      value: '',
      unit: 'km',
      seconds: ''
    }));
  }, [selectedExercise?._id]);

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setIsExerciseListOpen(false);
    onClose?.();
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectExercise = exercise => {
    setForm(prev => ({
      ...prev,
      exerciseId: exercise._id,
      weight: '',
      reps: '',
      sets: '',
      value: '',
      unit: 'km',
      seconds: ''
    }));
    setIsExerciseListOpen(false);
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!selectedExercise) return;

    const workout = {
      exerciseId: form.exerciseId,
      logType: selectedExercise.logType
    };

    if (selectedExercise.logType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS) {
      workout.weightAndRepsTarget = {
        weight: form.weight === '' ? undefined : Number(form.weight),
        reps: Number(form.reps),
        sets: Number(form.sets)
      };
    }

    if (selectedExercise.logType === WORKOUT_COUNTER_TYPE.DISTANCE) {
      workout.distanceTarget = {
        value: Number(form.value),
        unit: form.unit
      };
    }

    if (selectedExercise.logType === WORKOUT_COUNTER_TYPE.DURATION) {
      workout.durationTarget = {
        seconds: Number(form.seconds)
      };
    }

    addExerciseWorkout({
      scheduleId,
      workout
    });
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-[2px]'>
      <div className='flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl'>
        <div className='flex items-start justify-between border-b border-border/60 px-8 py-6'>
          <div>
            <h3 className='text-2xl font-black tracking-tight text-foreground'>
              Thêm bài tập
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Chọn bài tập trước, sau đó nhập mục tiêu tương ứng
            </p>
          </div>

          <button
            type='button'
            onClick={handleClose}
            className='flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground'
            title='Đóng'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-8 py-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <ExerciseSelectorSection
              exercises={exercises}
              selectedExercise={selectedExercise}
              form={form}
              isExerciseListOpen={isExerciseListOpen}
              setIsExerciseListOpen={setIsExerciseListOpen}
              onSelectExercise={handleSelectExercise}
            />

            {selectedExercise && (
              <SelectedExerciseSummary selectedExercise={selectedExercise} />
            )}

            {selectedExercise && (
              <WorkoutTargetFields
                selectedExercise={selectedExercise}
                selectedLogType={selectedLogType}
                form={form}
                onChange={handleChange}
              />
            )}

            <div className='mt-10 flex items-center justify-end gap-3 border-t border-border/60 pt-6'>
              <button
                type='button'
                onClick={handleClose}
                className='inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted'
              >
                Huỷ
              </button>
              <button
                type='submit'
                disabled={isPending || !selectedExercise}
                className='inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Plus className='mr-2 h-4 w-4' />
                {isPending ? 'Đang thêm...' : 'Thêm bài tập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
