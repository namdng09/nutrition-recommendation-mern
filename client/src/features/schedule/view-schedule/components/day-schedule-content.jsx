import { HiOutlinePlus } from 'react-icons/hi';

import SchedulePlan from './schedule-plan';

export default function DayScheduleContent({
  schedule,
  isDayToday,
  isCreating,
  handleCreate,
  getSmallMealIcon
}) {
  if (schedule) {
    return (
      <SchedulePlan schedule={schedule} getSmallMealIcon={getSmallMealIcon} />
    );
  }

  return (
    <div className='flex flex-col items-center justify-center py-20 px-8 rounded-[48px] bg-gradient-to-b from-muted/20 to-transparent border border-muted/10 group/empty'>
      <div className='relative mb-10'>
        <div className='absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse' />
        <div
          onClick={handleCreate}
          className='relative flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-2xl cursor-pointer'
        >
          {isCreating ? (
            <div className='h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin' />
          ) : (
            <HiOutlinePlus size={40} className='text-primary' />
          )}
        </div>
      </div>

      <div className='text-center space-y-2 mb-8'>
        <h3 className='text-xl font-black text-foreground tracking-tight'>
          Kế hoạch đang trống
        </h3>
        <p className='text-[13px] font-medium text-muted-foreground max-w-[200px] leading-relaxed'>
          Lên lịch ăn uống ngay để chúng mình theo dõi sức khỏe bạn nhé!
        </p>
      </div>

      <button
        disabled={isCreating}
        onClick={handleCreate}
        className='px-10 py-3.5 rounded-full bg-primary text-white text-[12px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all'
      >
        Lên lịch ngay
      </button>
    </div>
  );
}
