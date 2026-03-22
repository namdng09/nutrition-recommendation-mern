import {
  HiFire,
  HiOutlineCalendar,
  HiOutlineCollection,
  HiOutlineUser
} from 'react-icons/hi';

import InfoItem from './info-item';

export default function ScheduleOverviewCard({ schedule, totalCalories }) {
  return (
    <div className='relative overflow-hidden rounded-3xl border bg-card p-6 shadow-md'>
      <h3 className='mb-6 flex items-center gap-3 text-lg font-black tracking-tight text-foreground'>
        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10'>
          <HiOutlineCollection size={18} />
        </div>
        <span>Tổng quan ngày</span>
      </h3>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <InfoItem
          icon={<HiOutlineUser size={18} />}
          label='Người dùng'
          value={schedule.user.name}
          colorClass='text-green-light'
        />

        <InfoItem
          icon={<HiOutlineCalendar size={18} />}
          label='Thời gian'
          value={schedule.dayOfWeek}
          colorClass='text-blue-light'
        />

        <InfoItem
          icon={<HiOutlineCollection size={18} />}
          label='Chế độ'
          value={`${schedule.meals.length} bữa ăn`}
          colorClass='text-cyan-light'
        />

        <div className='group flex min-w-0 items-center gap-3 rounded-[1.25rem] bg-card px-4 py-3.5 text-orange-light shadow-sm ring-1 ring-border/60 transition-all'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 shadow-sm ring-1 ring-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20'>
            <HiFire size={18} />
          </div>

          <div className='min-w-0 space-y-0.5'>
            <p className='text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground'>
              Năng lượng
            </p>
            <p className='truncate text-lg font-black tracking-tight'>
              {Math.round(totalCalories)}{' '}
              <span className='text-xs font-semibold text-muted-foreground'>
                kcal
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
