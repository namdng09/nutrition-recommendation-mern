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
      <h3 className='flex items-center gap-2 text-lg font-black tracking-tight mb-6'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground'>
          <HiOutlineCollection size={18} />
        </div>
        Tổng quan ngày
      </h3>

      <div className='grid grid-cols-2 gap-5'>
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

        <div className='flex items-center gap-3 rounded-2xl border p-3 text-orange-light'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow'>
            <HiFire size={18} />
          </div>
          <div>
            <p className='text-[10px] uppercase tracking-wider font-bold'>
              Năng lượng
            </p>
            <p className='text-lg font-black'>
              {Math.round(totalCalories)}{' '}
              <span className='text-xs font-medium'>kcal</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
