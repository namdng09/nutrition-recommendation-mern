import { Dumbbell, MoveHorizontal, Scale, Target, Timer } from 'lucide-react';

import { WORKOUT_COUNTER_TYPE } from '../api/add-exercise-workout';

export default function WorkoutTargetFields({
  selectedExercise,
  selectedLogType,
  form,
  onChange
}) {
  return (
    <>
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
    </>
  );
}
