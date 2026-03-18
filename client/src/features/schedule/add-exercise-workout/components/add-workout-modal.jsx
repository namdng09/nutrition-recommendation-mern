import {
  Check,
  ChevronDown,
  Dumbbell,
  MoveHorizontal,
  Plus,
  Scale,
  Target,
  Timer,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useExercises } from '~/features/exercise/view-exercise/api/view-exercise';
import { getPreviewImage, isGifUrl } from '~/lib/utils';

import {
  useAddExerciseWorkout,
  WORKOUT_COUNTER_TYPE
} from '../api/add-exercise-workout';

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

  const isGif = isGifUrl(selectedExercise?.tutorial);
  const preview = getPreviewImage(selectedExercise?.tutorial);

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
            <div className='space-y-2'>
              <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                <Dumbbell className='h-4 w-4 text-muted-foreground' />
                Bài tập
              </label>

              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setIsExerciseListOpen(prev => !prev)}
                  className='flex h-16 w-full items-center justify-between rounded-2xl border border-border bg-background px-5 text-left outline-none transition hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15'
                >
                  {selectedExercise ? (
                    <div className='flex min-w-0 items-center gap-3'>
                      {selectedExercise.tutorial ? (
                        <div className='h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted'>
                          <img
                            src={preview}
                            alt={selectedExercise.name}
                            loading='lazy'
                            decoding='async'
                            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                            onMouseEnter={e => {
                              if (isGif)
                                e.currentTarget.src = selectedExercise.tutorial;
                            }}
                            onMouseLeave={e => {
                              if (isGif) e.currentTarget.src = preview;
                            }}
                          />
                        </div>
                      ) : (
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground'>
                          <Dumbbell className='h-4 w-4' />
                        </div>
                      )}

                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-foreground'>
                          {selectedExercise.name}
                        </p>
                        <p className='truncate text-xs text-muted-foreground'>
                          {selectedExercise.type}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className='text-sm text-muted-foreground'>
                      Chọn bài tập
                    </span>
                  )}

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition ${
                      isExerciseListOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExerciseListOpen && (
                  <div className='absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-[28rem] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl'>
                    {exercises.length === 0 ? (
                      <div className='px-3 py-6 text-center text-sm text-muted-foreground'>
                        Không có bài tập nào.
                      </div>
                    ) : (
                      <div className='space-y-1'>
                        {exercises.map(exercise => {
                          const isSelected =
                            String(exercise._id) === String(form.exerciseId);

                          return (
                            <button
                              key={exercise._id}
                              type='button'
                              onClick={() => handleSelectExercise(exercise)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                                isSelected
                                  ? 'bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              {exercise.tutorial ? (
                                <div className='h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted'>
                                  <img
                                    src={exercise.tutorial}
                                    alt={exercise.name}
                                    className='h-full w-full object-cover'
                                  />
                                </div>
                              ) : (
                                <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground'>
                                  <Dumbbell className='h-5 w-5' />
                                </div>
                              )}

                              <div className='min-w-0 flex-1'>
                                <p className='truncate text-sm font-semibold text-foreground'>
                                  {exercise.name}
                                </p>

                                <div className='mt-1 flex flex-wrap items-center gap-2'>
                                  {exercise.type && (
                                    <span className='inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600'>
                                      {exercise.type}
                                    </span>
                                  )}

                                  {exercise.difficulty && (
                                    <span className='inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600'>
                                      {exercise.difficulty}
                                    </span>
                                  )}

                                  {exercise.logType && (
                                    <span className='inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600'>
                                      {exercise.logType}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isSelected && (
                                <Check className='h-4 w-4 shrink-0 text-primary' />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedExercise && (
              <div className='rounded-2xl border border-border bg-muted/30 px-4 py-3'>
                <div className='flex items-start gap-3'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <Dumbbell className='h-5 w-5' />
                  </div>

                  <div className='min-w-0'>
                    <p className='truncate text-sm font-bold text-foreground'>
                      {selectedExercise.name}
                    </p>

                    <div className='mt-1 flex flex-wrap items-center gap-2'>
                      {selectedExercise.type && (
                        <span className='inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600'>
                          {selectedExercise.type}
                        </span>
                      )}

                      {selectedExercise.difficulty && (
                        <span className='inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600'>
                          {selectedExercise.difficulty}
                        </span>
                      )}

                      {selectedExercise.logType && (
                        <span className='inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600'>
                          {selectedExercise.logType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedExercise &&
              selectedLogType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS && (
                <div className='space-y-2 mb-8'>
                  <div className='flex items-center gap-2 pb-2'>
                    <Target className='h-4 w-4 text-primary' />
                    <h4 className='text-base font-bold tracking-tight text-foreground'>
                      Thiết lập mục tiêu
                    </h4>
                  </div>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    <div className='space-y-1.5'>
                      <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                        <Scale className='h-4 w-4 text-muted-foreground' />
                        Cân nặng
                      </label>
                      <div className='relative'>
                        <input
                          name='weight'
                          type='number'
                          min='0'
                          value={form.weight}
                          onChange={handleChange}
                          className='h-11 w-full rounded-2xl border border-border bg-background px-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'
                          placeholder='0'
                        />
                        <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground'>
                          kg
                        </span>
                      </div>
                    </div>

                    <div className='space-y-1.5'>
                      <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                        <Dumbbell className='h-4 w-4 text-muted-foreground' />
                        Số lần
                      </label>
                      <div className='relative'>
                        <input
                          name='reps'
                          type='number'
                          min='1'
                          value={form.reps}
                          onChange={handleChange}
                          className='h-11 w-full rounded-2xl border border-border bg-background px-4 pr-14 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'
                          placeholder='0'
                          required
                        />
                        <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground'>
                          lần
                        </span>
                      </div>
                    </div>

                    <div className='space-y-1.5'>
                      <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                        <Dumbbell className='h-4 w-4 text-muted-foreground' />
                        Số hiệp
                      </label>
                      <div className='relative'>
                        <input
                          name='sets'
                          type='number'
                          min='1'
                          value={form.sets}
                          onChange={handleChange}
                          className='h-11 w-full rounded-2xl border border-border bg-background px-4 pr-14 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'
                          placeholder='0'
                          required
                        />
                        <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground'>
                          hiệp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {selectedExercise &&
              selectedLogType === WORKOUT_COUNTER_TYPE.DISTANCE && (
                <div className='space-y-1.5 mb-9'>
                  <label className='text-sm font-semibold text-foreground'>
                    Thiết lập mục tiêu
                  </label>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]'>
                    <div className='space-y-1.5'>
                      <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                        <MoveHorizontal className='h-4 w-4 text-muted-foreground' />
                        Khoảng cách
                      </label>
                      <input
                        name='value'
                        type='number'
                        step='0.1'
                        min='0.1'
                        value={form.value}
                        onChange={handleChange}
                        className='h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'
                        placeholder='Nhập khoảng cách'
                        required
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <label className='text-sm font-semibold text-foreground'>
                        Đơn vị
                      </label>
                      <select
                        name='unit'
                        value={form.unit}
                        onChange={handleChange}
                        className='h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'
                      >
                        <option value='m'>m</option>
                        <option value='km'>km</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

            {selectedExercise &&
              selectedLogType === WORKOUT_COUNTER_TYPE.DURATION && (
                <div className='space-y-1.5 mb-6'>
                  <label className='text-sm font-semibold text-foreground'>
                    Thiết lập mục tiêu
                  </label>

                  <div className='space-y-1.5'>
                    <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                      <Timer className='h-4 w-4 text-muted-foreground' />
                      Thời gian
                    </label>
                    <div className='relative'>
                      <input
                        name='seconds'
                        type='number'
                        min='1'
                        value={form.seconds}
                        onChange={handleChange}
                        className='h-11 w-full rounded-2xl border border-border bg-background px-4 pr-16 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'
                        placeholder='Nhập thời gian'
                        required
                      />
                      <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground'>
                        giây
                      </span>
                    </div>
                  </div>
                </div>
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
