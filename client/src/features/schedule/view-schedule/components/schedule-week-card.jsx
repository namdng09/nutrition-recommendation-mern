import { format, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  IoCafe,
  IoCheckmarkCircleSharp,
  IoFastFood,
  IoMoon,
  IoRestaurant,
  IoSunny
} from 'react-icons/io5';

import { cn } from '~/lib/utils';

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
      relative min-w-[320px] flex-1 rounded-[40px] p-8
      flex flex-col transition-all duration-300
      bg-card
      border border-border
    `,
        isDayToday
          ? `
          border-primary/60
          bg-accent
          shadow-2xl
          scale-[1.02]
          z-10
        `
          : `
          hover:border-border/70
          hover:shadow-xl
        `
      )}
    >
      {isDayToday && (
        <div
          className='absolute -top-3.5 left-1/2 -translate-x-1/2 z-20
      rounded-full bg-primary
      px-4 py-1.5
      text-[10px] font-black uppercase tracking-tighter
      text-primary-foreground
      shadow-lg shadow-primary/40'
        >
          Hôm nay
        </div>
      )}

      <div className='mb-6 text-center'>
        <p
          className={cn(
            'text-[10px] font-black uppercase tracking-[0.15em] mb-1',
            isDayToday ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {format(date, 'EEEE', { locale: vi })}
        </p>

        <h3 className='text-2xl font-black text-foreground'>
          {format(date, 'dd')}
          <span className='text-xs font-bold text-muted-foreground ml-1'>
            / {format(date, 'MM')}
          </span>
        </h3>
      </div>

      <div className='flex-1 flex flex-col justify-between'>
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
