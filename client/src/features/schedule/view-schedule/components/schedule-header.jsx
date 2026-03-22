import { useState } from 'react';
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendar
} from 'react-icons/hi';
import { useNavigate } from 'react-router';

import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import { formatScheduleTitle } from '~/lib/utils';

import ScheduleViewSwitcher from './schedule-view-switcher';

export default function ScheduleHeader({
  view,
  onPrev,
  onNext,
  onSelectDate,
  onSelectRange,
  selectedDate
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleChangeView = v => {
    if (v === view) return;
    navigate(`/schedules/${v}`);
  };

  return (
    <div className='flex items-center justify-between rounded-[28px] border border-border/60 bg-card px-6 py-4 shadow-[0_10px_40px_rgba(45,106,79,0.06)]'>
      <div className='flex items-center gap-6'>
        <div className='scale-110 origin-left'>
          <ScheduleViewSwitcher view={view} onChange={handleChangeView} />
        </div>

        <div className='flex items-center gap-3 border-l-2 border-border/40 pl-6'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onPrev}
            className='h-11 w-11 rounded-2xl text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary'
          >
            <HiChevronLeft size={24} />
          </Button>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='
          h-11 gap-2.5 rounded-2xl border-border/80 bg-background
          px-5 text-[12px] font-black uppercase tracking-[0.1em] text-primary
          hover:bg-primary/10 hover:border-primary/40
          transition-all shadow-sm active:scale-95
        '
              >
                <HiOutlineCalendar size={18} />
                <span>Chọn ngày</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align='start'
              className='w-auto overflow-hidden rounded-[32px] border border-border/60 bg-card p-0 shadow-2xl'
            >
              <Calendar
                mode={view === 'day' ? 'single' : 'range'}
                selected={selectedDate}
                onSelect={val => {
                  if (view === 'day') {
                    onSelectDate?.(val);
                  } else {
                    onSelectRange?.(val);
                  }
                  setOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant='ghost'
            size='icon'
            onClick={onNext}
            className='h-11 w-11 rounded-2xl text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary'
          >
            <HiChevronRight size={24} />
          </Button>
        </div>
      </div>

      <div className='hidden md:flex flex-col items-end gap-1.5'>
        <h2 className='text-lg font-black capitalize leading-tight tracking-tight text-foreground'>
          {formatScheduleTitle(view, selectedDate)}
        </h2>
        <div className='rounded-full bg-primary px-3 py-1 shadow-lg shadow-primary/20'>
          <p className='text-[9px] font-black uppercase tracking-[0.2em] text-primary-foreground'>
            {view === 'day' ? 'Lịch trình ngày' : 'Kế hoạch tuần'}
          </p>
        </div>
      </div>
    </div>
  );
}
