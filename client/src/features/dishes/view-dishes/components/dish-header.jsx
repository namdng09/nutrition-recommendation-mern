import { FaListUl, FaUtensils } from 'react-icons/fa';

export default function DishHeader({ total = 0 }) {
  return (
    <div className='relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-500/[0.08] via-background to-background px-6 py-8 shadow-sm sm:px-8 sm:py-10'>
      <div className='absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl' />
      <div className='absolute -bottom-14 left-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl' />

      <div className='relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        <div className='max-w-2xl space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5'>
            <span className='text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700/80'>
              Dish Library
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg'>
              <FaUtensils className='text-xl' />
            </div>

            <h2 className='text-3xl font-black tracking-tight text-foreground sm:text-4xl'>
              Danh sách <span className='text-emerald-600'>món ăn</span>
            </h2>
          </div>

          <p className='max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-[15px]'>
            Khám phá {total} công thức nấu ăn ngon mỗi ngày từ cộng đồng với
            trải nghiệm trực quan, dễ tìm kiếm và đầy cảm hứng.
          </p>
        </div>

        <div className='self-start md:self-end'>
          <span className='inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm font-bold text-secondary-foreground shadow-sm backdrop-blur'>
            <FaListUl className='text-emerald-600' />
            {total} món ăn khả dụng
          </span>
        </div>
      </div>
    </div>
  );
}
