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
        {/* VIEW SWITCHER - To và rõ hơn */}
        <div className='scale-110 origin-left'>
          <ScheduleViewSwitcher view={view} onChange={handleChangeView} />
        </div>

        {/* DATE CONTROLS */}
        <div className='flex items-center gap-3 border-l-2 border-border/40 pl-6'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onPrev}
            className='h-11 w-11 rounded-2xl text-muted-foreground hover:bg-[#F0F7F4] hover:text-[#2D6A4F] transition-all'
          >
            <HiChevronLeft size={24} />
          </Button>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='
              h-11 gap-2.5 rounded-2xl border-border/80 bg-background
              px-5 text-[12px] font-black uppercase tracking-[0.1em] text-[#2D6A4F]
              hover:bg-[#F0F7F4] hover:border-[#2D6A4F]/40
              transition-all shadow-sm active:scale-95
            '
              >
                <HiOutlineCalendar size={18} />
                <span>Chọn ngày</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align='start'
              className='w-auto p-0 rounded-[32px] border border-border/60 bg-card shadow-2xl overflow-hidden'
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
            className='h-11 w-11 rounded-2xl text-muted-foreground hover:bg-[#F0F7F4] hover:text-[#2D6A4F] transition-all'
          >
            <HiChevronRight size={24} />
          </Button>
        </div>
      </div>

      <div className='hidden md:flex flex-col items-end gap-1.5'>
        <h2 className='text-lg font-black capitalize leading-tight text-[#1B4332] tracking-tight'>
          {formatScheduleTitle(view, selectedDate)}
        </h2>
        <div className='rounded-full bg-[#2D6A4F] px-3 py-1 shadow-lg shadow-[#2D6A4F]/20'>
          <p className='text-[9px] font-black uppercase tracking-[0.2em] text-white'>
            {view === 'day' ? 'Lịch trình ngày' : 'Kế hoạch tuần'}
          </p>
        </div>
      </div>
    </div>
  );
}
