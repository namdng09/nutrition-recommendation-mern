import {
  HiFire,
  HiOutlineCalendar,
  HiOutlineCollection,
  HiOutlineUser
} from 'react-icons/hi';

import InfoItem from './info-item';

export default function ScheduleOverviewCard({ schedule, totalCalories }) {
  return (
    <div className='relative self-start overflow-hidden rounded-3xl border bg-card p-6 shadow-md'>
      <h3 className='mb-6 flex items-center gap-2 text-lg font-black tracking-tight'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground'>
          <HiOutlineCollection size={18} />
        </div>
        <span className='truncate'>Tổng quan ngày</span>
      </h3>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <InfoItem
          icon={<HiOutlineUser size={18} />}
          label='Người dùng'
          value={schedule.user?.name || '--'}
          colorClass='text-green-light'
        />

        <InfoItem
          icon={<HiOutlineCalendar size={18} />}
          label='Thời gian'
          value={schedule.dayOfWeek || '--'}
          colorClass='text-blue-light'
        />

        <InfoItem
          icon={<HiOutlineCollection size={18} />}
          label='Chế độ'
          value={`${schedule?.meals?.length || 0} bữa ăn`}
          colorClass='text-cyan-light'
        />

        <div className='flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-orange-light'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow'>
            <HiFire size={18} />
          </div>

          <div className='min-w-0'>
            <p className='text-[10px] font-bold uppercase tracking-wider'>
              Năng lượng
            </p>
            <p className='truncate text-lg font-black'>
              {Math.round(totalCalories || 0)}{' '}
              <span className='text-xs font-medium'>kcal</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
