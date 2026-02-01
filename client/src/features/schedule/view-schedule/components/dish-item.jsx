import { HiFire } from 'react-icons/hi';

export default function DishItem({ dishes = [] }) {
  if (!dishes.length) {
    return (
      <p className='mt-2 text-[13px] font-medium italic text-slate-400 dark:text-slate-500'>
        Chưa có món ăn được chọn
      </p>
    );
  }

  return (
    <div className='mt-4 grid grid-cols-1 gap-3'>
      {dishes.map(dish => (
        <div
          key={dish._id}
          className='
            group rounded-2xl overflow-hidden
            bg-white dark:bg-slate-800/60
            border border-slate-100 dark:border-slate-700/50
            shadow-sm hover:shadow-md
            transition-all
          '
        >
          <div className='relative h-28 w-full overflow-hidden'>
            {dish.image ? (
              <img
                src={dish.image}
                alt={dish.name}
                className='
                  h-full w-full object-cover
                  transition-transform duration-500
                '
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-300'>
                <HiFire size={32} />
              </div>
            )}

            {typeof dish.servings === 'number' && (
              <div
                className='
                  absolute bottom-2 right-2
                  rounded-full bg-red-500 px-2.5 py-0.5
                  text-[11px] font-black text-white shadow
                '
              >
                {dish.servings} khẩu phần
              </div>
            )}
          </div>

          <div className='p-3'>
            <h5 className='text-[15px] font-black text-slate-900 dark:text-slate-100 leading-tight truncate'>
              {dish.name}
            </h5>

            <div className='mt-2 flex items-center gap-2 text-[12px] font-bold text-slate-500 dark:text-slate-400'>
              <HiFire size={14} className='text-red-500' />
              {dish.calories || 0} kcal
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
