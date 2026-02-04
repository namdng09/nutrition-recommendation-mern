import { HiOutlineCalendarDays } from 'react-icons/hi2';

export default function ScheduleEmptyState({ onCreate, isCreating }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-3xl bg-card p-16 text-center'>
      <div className='relative mb-6 flex h-24 w-24 items-center justify-center'>
        <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-background shadow'>
          <HiOutlineCalendarDays className='text-muted-foreground' size={40} />
        </div>
      </div>

      <div className='max-w-[260px]'>
        <h3 className='text-lg font-black'>Chưa có lịch ăn</h3>
        <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
          Bạn chưa thiết lập thực đơn cho ngày hôm nay. Hãy bắt đầu lên kế hoạch
          ngay nhé!
        </p>
      </div>

      <button
        disabled={isCreating}
        onClick={onCreate}
        className='mt-8 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow transition
        hover:brightness-110 active:scale-95 disabled:opacity-50'
      >
        {isCreating ? 'Đang tạo...' : 'Tạo lịch ngay'}
      </button>
    </div>
  );
}
