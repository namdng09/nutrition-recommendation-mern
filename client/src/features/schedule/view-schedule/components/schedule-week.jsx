import { useMemo } from 'react';

import { buildWeekDaysWithSchedules } from '~/lib/utils';

import { useCreateSchedule } from '../../create-schedule/api/create-schedule';
import { useSchedules } from '../api/view-schedule';
import ScheduleWeekCard from './schedule-week-card';

export default function ScheduleWeek({ startOfSelectedWeek }) {
  const { data } = useSchedules({ limit: 1000 });
  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();

  const docs = useMemo(
    () => (Array.isArray(data?.docs) ? data.docs : []),
    [data]
  );

  const weekDays = useMemo(
    () => buildWeekDaysWithSchedules(startOfSelectedWeek, docs),
    [startOfSelectedWeek, docs]
  );

  return (
    <div className='flex gap-5 overflow-x-auto pb-6 pt-6 px-2 scrollbar-hide'>
      {weekDays.map(({ date, schedule }, index) => (
        <ScheduleWeekCard
          key={index}
          date={date}
          schedule={schedule}
          isCreating={isCreating}
          onCreateEmptyDay={createSchedule}
        />
      ))}
    </div>
  );
}
