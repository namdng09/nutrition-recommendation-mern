import { isSameDay } from 'date-fns';
import { HiOutlineClipboardList } from 'react-icons/hi';

import { useSchedules } from '../api/view-schedule';
import ScheduleTodayCard from './schedule-today-card';

export default function ScheduleToday({ selectedDate = new Date() }) {
  const { data } = useSchedules({ limit: 1000 });
  const docs = Array.isArray(data?.docs) ? data.docs : [];

  const todaySchedules = docs.filter(s =>
    isSameDay(new Date(s.date), selectedDate)
  );

  if (todaySchedules.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white p-12 text-center max-w-md mx-auto'>
        <HiOutlineClipboardList className='text-slate-300 mb-2' size={32} />
        <p className='text-[11px] font-black text-slate-400 uppercase tracking-widest'>
          Trống lịch ăn
        </p>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      {todaySchedules.map(schedule => (
        <ScheduleTodayCard
          key={schedule._id}
          schedule={schedule}
          selectedDate={selectedDate}
        />
      ))}
    </div>
  );
}
