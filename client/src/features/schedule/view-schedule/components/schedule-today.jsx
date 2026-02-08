import { format, isSameDay, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useCreateSchedule } from '../../create-schedule/api/create-schedule';
import ScheduleTodayDetail from '../../view-schedule-detail/components/schedule-today-detail';
import { useSchedules } from '../api/view-schedule';
import ScheduleEmptyState from './schedule-empty-state';
import ScheduleTodayCard from './schedule-today-card';

export default function ScheduleToday({ selectedDate = new Date() }) {
  const { data } = useSchedules({ limit: 1000 });
  const { mutate: createSchedule, isPending } = useCreateSchedule();

  const docs = Array.isArray(data?.docs) ? data.docs : [];
  const todaySchedules = docs.filter(s =>
    isSameDay(new Date(s.date), selectedDate)
  );
  const schedule = todaySchedules[0];

  const handleCreateToday = () => {
    createSchedule({
      date: startOfDay(selectedDate),
      dayOfWeek: format(selectedDate, 'EEEE', { locale: vi })
    });
  };

  if (!schedule) {
    return (
      <ScheduleEmptyState onCreate={handleCreateToday} isCreating={isPending} />
    );
  }

  return (
    <div className='w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10'>
      <ScheduleTodayCard schedule={schedule} selectedDate={selectedDate} />
      <ScheduleTodayDetail scheduleId={schedule._id} />
    </div>
  );
}
