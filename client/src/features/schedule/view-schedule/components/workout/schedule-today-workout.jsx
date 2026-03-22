import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Dumbbell,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { HiSparkles } from 'react-icons/hi';
import { useNavigate } from 'react-router';

import { useDeleteExerciseWorkout } from '~/features/schedule/delete-exercise-workout/api/delete-exercise-workout';
import { useUpdateExerciseWorkout } from '~/features/schedule/update-exercise-workout/api/update-exercise-workout';
import { getPreviewImage, isGifUrl } from '~/lib/utils';

export default function ScheduleTodayWorkout({
  schedule,
  onEditWorkout,
  onAddWorkout,
  onGenerateWorkoutAI,
  isGeneratingWorkoutAI
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate: updateExercise, isPending } = useUpdateExerciseWorkout();
  const { mutate: deleteExercise, isPending: isDeleting } =
    useDeleteExerciseWorkout();

  const workouts = Array.isArray(schedule?.workout) ? schedule.workout : [];

  const handleToggleCompleted = item => {
    updateExercise({
      scheduleId: schedule._id,
      exerciseId: item.exerciseId,
      workout: {
        logType: item.logType,
        distanceTarget: item.distanceTarget,
        weightAndRepsTarget: item.weightAndRepsTarget,
        durationTarget: item.durationTarget,
        isCompleted: !item.isCompleted
      }
    });
  };

  const handleDeleteExercise = item => {
    deleteExercise({
      scheduleId: schedule._id,
      exerciseId: item.exerciseId
    });
  };

  return (
    <div className='w-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300'>
      <div className='flex items-center justify-between px-6 py-5'>
        <button
          type='button'
          onClick={() => setIsOpen(prev => !prev)}
          className='flex min-w-0 flex-1 items-center gap-4 rounded-2xl text-left transition-colors hover:bg-muted/30'
        >
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-inner'>
            <Dumbbell className='h-6 w-6' />
          </div>

          <div>
            <h3 className='text-lg font-bold text-foreground'>
              Bài tập hôm nay
            </h3>
            <p className='text-sm font-medium text-muted-foreground'>
              {workouts.length} bài tập cần hoàn thành
            </p>
          </div>
        </button>

        <div className='ml-4 flex shrink-0 items-center gap-3'>
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              onGenerateWorkoutAI?.();
            }}
            disabled={isGeneratingWorkoutAI}
            className='group flex h-10 items-center gap-2 rounded-xl bg-purple-50 px-4 text-purple-600 transition-all hover:bg-purple-600 hover:text-white disabled:opacity-50 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-600 dark:hover:text-white'
          >
            {isGeneratingWorkoutAI ? (
              <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
            ) : (
              <HiSparkles className='h-4 w-4 transition-transform group-hover:rotate-12' />
            )}
            <span className='text-[12px] font-black uppercase tracking-wider'>
              AI Gợi ý
            </span>
          </button>

          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              onAddWorkout?.();
            }}
            className='flex h-10 items-center gap-2 rounded-xl bg-primary/10 px-4 text-primary transition-all hover:bg-primary hover:text-white'
          >
            <Plus className='h-4 w-4' />
            <span className='text-[12px] font-black uppercase tracking-wider'>
              Thêm bài tập
            </span>
          </button>

          <button
            type='button'
            onClick={() => setIsOpen(prev => !prev)}
            className={`flex h-10 items-center gap-1 rounded-xl px-2 transition-all duration-300 ${
              isOpen
                ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className='border-t bg-card px-2 pb-2'>
          {workouts.length === 0 ? (
            <div className='mx-4 my-6 rounded-xl bg-muted/40 px-4 py-8 text-center text-sm font-medium text-muted-foreground'>
              Chưa có bài tập nào cho ngày này.
            </div>
          ) : (
            <div className='divide-y divide-border/50'>
              {workouts.map((item, index) => {
                const target = item?.weightAndRepsTarget;
                const duration = item?.durationTarget;
                const distance = item?.distanceTarget;
                const isGif = isGifUrl(item.exerciseTutorial);
                const preview = getPreviewImage(item.exerciseTutorial);

                return (
                  <div
                    key={item.exerciseId || index}
                    onClick={() => navigate(`/exercises/${item.exerciseId}`)}
                    className='group flex cursor-pointer items-center justify-between rounded-xl px-4 py-4 transition-all duration-200 hover:bg-orange-50/40'
                  >
                    <div className='flex min-w-0 flex-1 items-center gap-4'>
                      <button
                        type='button'
                        disabled={isPending}
                        onClick={e => {
                          e.stopPropagation();
                          handleToggleCompleted(item);
                        }}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background transition-all duration-200 disabled:opacity-50 ${
                          item.isCompleted
                            ? 'border-green-200 bg-green-50 text-green-500'
                            : 'border-border/60 text-muted-foreground hover:scale-105 hover:border-green-200 hover:bg-green-50 hover:text-green-500'
                        }`}
                        title={
                          item.isCompleted
                            ? 'Đánh dấu chưa hoàn thành'
                            : 'Đánh dấu hoàn thành'
                        }
                      >
                        {item.isCompleted ? (
                          <CheckCircle2 className='h-5 w-5' />
                        ) : (
                          <Circle className='h-5 w-5' />
                        )}
                      </button>

                      {item.exerciseTutorial ? (
                        <div className='h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted'>
                          <img
                            src={preview}
                            alt={item.exerciseName}
                            loading='lazy'
                            decoding='async'
                            className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
                            onMouseEnter={e => {
                              if (isGif)
                                e.currentTarget.src = item.exerciseTutorial;
                            }}
                            onMouseLeave={e => {
                              if (isGif) e.currentTarget.src = preview;
                            }}
                          />
                        </div>
                      ) : (
                        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground'>
                          <Dumbbell className='h-5 w-5' />
                        </div>
                      )}

                      <div className='min-w-0 flex-1'>
                        <h4
                          className={`truncate text-sm font-bold transition-colors ${
                            item.isCompleted
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground group-hover:text-orange-600'
                          }`}
                        >
                          {item.exerciseName}
                        </h4>

                        <div className='mt-2 flex flex-wrap items-center gap-2'>
                          {target?.sets && target?.reps && (
                            <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground'>
                              {target.sets} hiệp
                              <span className='mx-1 text-border'>•</span>
                              {target.reps} lần
                              {typeof target.weight === 'number' && (
                                <>
                                  <span className='mx-1 text-border'>•</span>
                                  {target.weight} kg
                                </>
                              )}
                            </span>
                          )}

                          {duration?.seconds && (
                            <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground'>
                              {duration.seconds} giây
                            </span>
                          )}

                          {distance?.value && distance?.unit && (
                            <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground'>
                              {distance.value} {distance.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='ml-4 flex shrink-0 items-center gap-2'>
                      <button
                        type='button'
                        disabled={isPending}
                        onClick={e => {
                          e.stopPropagation();
                          handleToggleCompleted(item);
                        }}
                        className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:scale-105 hover:bg-green-100 hover:text-green-600 disabled:opacity-50'
                        title='Đánh dấu hoàn thành'
                      >
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            item.isCompleted
                              ? 'text-green-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>

                      <button
                        type='button'
                        onClick={e => {
                          e.stopPropagation();
                          onEditWorkout?.(item);
                        }}
                        className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:scale-105 hover:bg-primary/10 hover:text-primary'
                        title='Chỉnh sửa bài tập'
                      >
                        <Pencil className='h-4 w-4' />
                      </button>

                      <button
                        type='button'
                        disabled={isDeleting}
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteExercise(item);
                        }}
                        className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:scale-105 hover:bg-red-100 hover:text-red-600 disabled:opacity-50'
                        title='Xoá bài tập'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
