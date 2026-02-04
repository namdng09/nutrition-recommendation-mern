import { addWeeks, startOfWeek, subWeeks } from 'date-fns';
import { useState } from 'react';

import ScheduleHeader from '~/features/schedule/view-schedule/components/schedule-header';
import ScheduleWeek from '~/features/schedule/view-schedule/components/schedule-week';

export default function ScheduleWeekContent() {
  const [currentWeekDate, setCurrentWeekDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  return (
    <div className='max-w-8xl mx-auto space-y-6 px-4 py-8'>
      <ScheduleHeader
        view='week'
        selectedDate={currentWeekDate}
        onSelectDate={setCurrentWeekDate}
        onPrev={() => setCurrentWeekDate(d => subWeeks(d, 1))}
        onNext={() => setCurrentWeekDate(d => addWeeks(d, 1))}
      />

      <div className='rounded-3xl border border-slate-200 px-6 py-6'>
        <ScheduleWeek startOfSelectedWeek={currentWeekDate} />
      </div>
    </div>
  );
}
