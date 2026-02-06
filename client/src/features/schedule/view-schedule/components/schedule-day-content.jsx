import { addDays, subDays } from 'date-fns';
import { useState } from 'react';

import ScheduleHeader from './schedule-header';
import ScheduleToday from './schedule-today';

export default function ScheduleDayContent() {
  const [date, setDate] = useState(new Date());

  return (
    <div className='max-w-7xl mx-auto space-y-6 px-4 py-8'>
      <ScheduleHeader
        view='day'
        selectedDate={date}
        onSelectDate={setDate}
        onPrev={() => setDate(d => subDays(d, 1))}
        onNext={() => setDate(d => addDays(d, 1))}
      />

      <div className='rounded-3xl border border-slate-200 px-6 py-6 shadow-sm'>
        <ScheduleToday selectedDate={date} />
      </div>
    </div>
  );
}
