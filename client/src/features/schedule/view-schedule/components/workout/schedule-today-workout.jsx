import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Dumbbell,
  PlayCircle
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

export default function ScheduleTodayWorkout({ schedule }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const workouts = useMemo(() => {
    return Array.isArray(schedule?.workout) ? schedule.workout : [];
  }, [schedule]);

  return (
    <div className='w-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300'>
      <button
        type='button'
        onClick={() => setIsOpen(prev => !prev)}
        className='flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-muted/30'
      >
        <div className='flex items-center gap-4'>
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
        </div>

        <div
          className={`rounded-full p-2 transition-all duration-300 ${
            isOpen
              ? 'rotate-180 bg-muted text-orange-600'
              : 'text-muted-foreground'
          }`}
        >
          <ChevronDown className='h-5 w-5' />
        </div>
      </button>

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

                return (
                  <div
                    key={item.exerciseId || index}
                    onClick={() => navigate(`/exercises/${item.exerciseId}`)}
                    className='group flex cursor-pointer items-center justify-between rounded-xl px-4 py-4 transition-all hover:bg-orange-50/40'
                  >
                    <div className='flex min-w-0 flex-1 items-center gap-4'>
                      <div className='shrink-0'>
                        {item.isCompleted ? (
                          <CheckCircle2 className='h-5 w-5 text-green-500' />
                        ) : (
                          <Circle className='h-5 w-5 text-gray-300' />
                        )}
                      </div>

                      <div className='min-w-0'>
                        <h4 className='truncate text-sm font-bold text-foreground transition-colors group-hover:text-orange-600'>
                          {item.exerciseName}
                        </h4>

                        <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1'>
                          {target?.sets && target?.reps && (
                            <span className='text-xs font-semibold text-muted-foreground'>
                              {target.sets} hiệp
                              <span className='mx-0.5 text-gray-300'>•</span>
                              {target.reps} lần
                            </span>
                          )}

                          {item.exerciseType && (
                            <span className='inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600'>
                              {item.exerciseType}
                            </span>
                          )}

                          {item.logType && (
                            <span className='inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600'>
                              {item.logType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='ml-4 flex shrink-0 items-center gap-3'>
                      <span className='hidden text-[11px] font-bold text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 sm:block'>
                        HƯỚNG DẪN
                      </span>
                      <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-orange-100 group-hover:text-orange-600'>
                        <PlayCircle className='h-5 w-5' />
                      </div>
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
