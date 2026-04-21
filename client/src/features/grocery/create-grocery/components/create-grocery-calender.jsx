import React, { memo, useCallback, useState } from 'react';
import { IoCalendarOutline } from 'react-icons/io5';

import { Calendar } from '~/components/ui/calendar';

function CreateGroceryCalendarComponent({ dates, setDates }) {
  const [month, setMonth] = useState(dates?.[0] || new Date());

  const handleSelect = useCallback(
    selectedDates => {
      setDates(selectedDates || []);
    },
    [setDates]
  );

  return (
    <div className='space-y-2.5'>
      <label className='ml-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70'>
        <IoCalendarOutline size={14} className='text-primary' />
        Chọn ngày thực hiện
      </label>

      <div className='flex w-full justify-center rounded-[24px] border border-border/50 bg-muted/10 p-3 shadow-inner'>
        <Calendar
          mode='multiple'
          month={month}
          onMonthChange={setMonth}
          selected={dates}
          onSelect={handleSelect}
          className='w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full'
        />
      </div>
    </div>
  );
}

const CreateGroceryCalendar = memo(CreateGroceryCalendarComponent);

export default CreateGroceryCalendar;
