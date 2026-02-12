import { IoCalendarOutline } from 'react-icons/io5';

import { Calendar } from '~/components/ui/calendar';

export default function CreateGroceryCalendar({ dates, setDates }) {
  return (
    <div className='space-y-2.5'>
      <label className='text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1 flex items-center gap-2'>
        <IoCalendarOutline size={14} className='text-primary' />
        Chọn ngày thực hiện
      </label>

      <div className='rounded-[24px] border border-border/50 p-3 bg-muted/10 w-full flex justify-center shadow-inner'>
        <Calendar
          mode='multiple'
          selected={dates}
          onSelect={d => setDates(d ?? [])}
          className='w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full'
        />
      </div>
    </div>
  );
}
