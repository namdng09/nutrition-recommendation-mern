import { HiOutlineCalendarDays, HiPlus } from 'react-icons/hi2';

export default function ScheduleEmptyState({ onCreate, isCreating }) {
  return (
    <div className='relative flex flex-col items-center justify-center rounded-[48px] bg-card p-12 text-center transition-all duration-500 sm:p-20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]'>
      <div className='relative mb-10'>
        <div className='relative flex h-28 w-28 items-center justify-center rounded-[32px] bg-secondary/30 dark:bg-muted/20'>
          <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-accent text-primary'>
            <HiOutlineCalendarDays size={42} />
          </div>

          <div className='absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl bg-card dark:bg-zinc-800'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <HiPlus size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className='relative z-10 max-w-[300px]'>
        <h3 className='text-3xl font-black tracking-tighter text-foreground sm:text-4xl'>
          Kế hoạch trống
        </h3>
        <p className='mt-4 text-[14px] font-medium leading-relaxed text-muted-foreground/60'>
          Bạn chưa lên lịch cho hôm nay.
          <span className='block mt-0.5 font-bold text-primary/80'>
            Bắt đầu ngay để theo dõi sức khỏe!
          </span>
        </p>
      </div>

      <div className='mt-12 flex flex-col items-center gap-4'>
        <button
          disabled={isCreating}
          onClick={onCreate}
          className='group relative flex items-center justify-center gap-3 rounded-full bg-primary px-10 py-4.5 text-[13px] font-black uppercase tracking-[0.2em] text-primary-foreground transition-all hover:brightness-110 active:scale-95 disabled:opacity-50'
        >
          {isCreating ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground' />
              <span>Đang tạo...</span>
            </>
          ) : (
            <>
              <span>Bắt đầu ngay</span>
              <HiPlus
                size={16}
                className='transition-transform group-hover:rotate-90'
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
