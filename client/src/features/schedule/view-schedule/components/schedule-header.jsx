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
    <div className='flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm'>
      <div className='flex items-center gap-4'>
        <ScheduleViewSwitcher view={view} onChange={handleChangeView} />

        <div className='flex items-center gap-1 border-l border-border pl-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onPrev}
            className='h-8 w-8 rounded-lg hover:bg-accent hover:text-primary transition-colors'
          >
            <HiChevronLeft size={18} />
          </Button>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='
                  h-8 gap-1.5 rounded-lg border-border bg-background
                  px-2.5 text-xs font-bold text-muted-foreground
                  hover:bg-accent hover:border-primary/30 hover:text-primary
                  transition-all
                '
              >
                <HiOutlineCalendar size={15} className='text-primary' />
                <span>Chọn ngày</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align='start'
              className='w-auto p-0 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden'
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
            className='h-8 w-8 rounded-lg hover:bg-accent hover:text-primary transition-colors'
          >
            <HiChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className='hidden sm:block text-right'>
        <h2 className='text-sm font-black capitalize leading-none text-foreground'>
          {formatScheduleTitle(view, selectedDate)}
        </h2>
        <p className='mt-1 text-[9px] font-bold uppercase tracking-widest text-primary/60'>
          {view === 'day' ? 'Hàng ngày' : 'Cả tuần'}
        </p>
      </div>
    </div>
  );
}
