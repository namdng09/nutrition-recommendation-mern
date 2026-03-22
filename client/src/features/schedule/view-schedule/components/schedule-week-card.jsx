import { format, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HiOutlineTrash } from 'react-icons/hi';
import {
  IoCafe,
  IoFastFood,
  IoMoon,
  IoRestaurant,
  IoSunny
} from 'react-icons/io5';

import { cn } from '~/lib/utils';

import DeleteScheduleModal from '../../delete-schedule/components/delete-schedule-modal';
import DayScheduleContent from './day-schedule-content';

const getSmallMealIcon = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('sáng')) return <IoCafe className='text-orange-400' />;
  if (t.includes('trưa')) return <IoSunny className='text-amber-500' />;
  if (t.includes('tối')) return <IoMoon className='text-indigo-400' />;
  if (t.includes('nhẹ')) return <IoRestaurant className='text-violet-400' />;
  return <IoFastFood className='text-emerald-500' />;
};

export default function ScheduleWeekCard({
  date,
  schedule,
  isCreating,
  onCreateEmptyDay
}) {
  const isDayToday = isToday(date);

  const handleCreate = () => {
    onCreateEmptyDay({
      date: format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      dayOfWeek: format(date, 'EEEE', { locale: vi })
    });
  };

  return (
    <div
      className={cn(
        `
      relative min-w-[340px] h-fit rounded-[32px] p-6
      flex flex-col transition-all duration-500
      bg-card border-2 border-border/60 text-foreground
    `,
        isDayToday
          ? `
          border-primary
          bg-primary/5
          shadow-[0_20px_50px_rgba(0,0,0,0.08)]
          dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]
          z-10
        `
          : `
          hover:border-primary/40
          hover:shadow-xl
        `
      )}
    >
      {schedule && (
        <DeleteScheduleModal scheduleId={schedule._id}>
          <button
            className='
          absolute top-4 right-4
          flex h-9 w-9 items-center justify-center
          rounded-xl
          border border-border
          bg-background/80 backdrop-blur
          text-destructive
          shadow-sm
          hover:bg-destructive/10
          hover:border-destructive/30
          hover:shadow-md
          active:scale-95
          transition-all
        '
          >
            <HiOutlineTrash size={18} />
          </button>
        </DeleteScheduleModal>
      )}

      {isDayToday && (
        <div
          className='
        absolute -top-3.5 left-1/2 -translate-x-1/2 z-20
        rounded-full bg-primary
        px-6 py-1.5
        text-[10px] font-black uppercase tracking-widest
        text-primary-foreground border-2 border-background
        shadow-lg shadow-primary/30
      '
        >
          Hôm nay
        </div>
      )}

      <div className='mb-6 text-center pt-2'>
        <p
          className={cn(
            'text-[11px] font-black uppercase tracking-[0.2em] mb-1.5',
            isDayToday ? 'text-primary' : 'text-muted-foreground/60'
          )}
        >
          {format(date, 'EEEE', { locale: vi })}
        </p>

        <h3 className='flex items-baseline justify-center gap-1'>
          <span className='text-4xl font-black text-foreground tracking-tighter'>
            {format(date, 'dd')}
          </span>
          <span className='text-sm font-bold text-muted-foreground/50'>
            / {format(date, 'MM')}
          </span>
        </h3>
      </div>

      <div className='w-full'>
        <DayScheduleContent
          schedule={schedule}
          isDayToday={isDayToday}
          isCreating={isCreating}
          handleCreate={handleCreate}
          getSmallMealIcon={getSmallMealIcon}
        />
      </div>
    </div>
  );
}
