import { FaListUl, FaUtensils } from 'react-icons/fa';

export default function DishHeader({ total = 0 }) {
  return (
    <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8'>
      <div className='space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200'>
            <FaUtensils className='text-xl text-white' />
          </div>

          <h2 className='text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
            Danh sách <span className='text-emerald-600'>món ăn</span>
          </h2>
        </div>

        <p className='text-muted-foreground font-medium'>
          Khám phá {total} công thức nấu ăn ngon mỗi ngày từ cộng đồng
        </p>
      </div>

      <div className='hidden md:block'>
        <span className='inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground'>
          <FaListUl className='text-emerald-600' />
          {total} món ăn khả dụng
        </span>
      </div>
    </div>
  );
}
