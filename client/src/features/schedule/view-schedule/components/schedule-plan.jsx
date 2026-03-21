import {
  HiFire,
  HiOutlineChevronRight,
  HiOutlineClipboardList,
  HiOutlineDotsVertical,
  HiOutlineTrash
} from 'react-icons/hi';
import { Link } from 'react-router';

import AddFoodModal from './add-food-modal';
import DeleteDishModal from './delete-dish-modal';

export default function SchedulePlan({ schedule, getSmallMealIcon }) {
  return (
    <div className='space-y-8'>
      {schedule.meals.map(meal => (
        <div key={meal._id} className='relative group/meal'>
          <div className='mb-4 flex items-center justify-between px-2'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-primary/15 to-primary/5 text-2xl shadow-inner'>
                {getSmallMealIcon(meal.mealType)}
              </div>
              <div>
                <h5 className='text-[15px] font-black uppercase tracking-tight text-foreground'>
                  {meal.mealType}
                </h5>
                <div className='mt-0.5 flex items-center gap-2'>
                  <span className='h-1 w-1 rounded-full bg-primary/40' />
                  <p className='text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60'>
                    {meal.dishes.length} món đã lên lịch
                  </p>
                </div>
              </div>
            </div>

            <AddFoodModal
              mealType={meal.mealType}
              scheduleId={schedule._id}
              scheduleMeals={schedule.meals}
            >
              <button className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground'>
                <HiOutlineDotsVertical size={18} />
              </button>
            </AddFoodModal>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {meal.dishes.length > 0 ? (
              meal.dishes.map(dish => (
                <div key={dish._id} className='group/dish relative'>
                  <Link
                    to={`/dishes/${dish.dishId}`}
                    className='flex h-full flex-col overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_15px_35px_rgb(0,0,0,0.10)]'
                  >
                    <div className='relative h-36 w-full overflow-hidden bg-muted'>
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className='h-full w-full object-cover transition-transform duration-700 group-hover/dish:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40' />
                      <div className='absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-black text-primary shadow-sm backdrop-blur'>
                        <HiFire size={12} />
                        {dish.energy} kcal
                      </div>
                    </div>

                    <div className='p-4'>
                      <h4 className='mb-1 truncate text-[14px] font-black leading-tight text-foreground transition-colors group-hover/dish:text-primary'>
                        {dish.name}
                      </h4>
                      <p className='text-[11px] font-bold uppercase tracking-tighter text-muted-foreground/70'>
                        {dish.servings} khẩu phần
                      </p>
                    </div>
                  </Link>

                  <div className='absolute -right-1 -top-1 scale-75 opacity-0 transition-all group-hover/dish:scale-100 group-hover/dish:opacity-100'>
                    <DeleteDishModal
                      scheduleId={schedule._id}
                      mealType={meal.mealType}
                      dishId={dish.dishId}
                    >
                      <button className='flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xl transition-transform'>
                        <HiOutlineTrash size={14} />
                      </button>
                    </DeleteDishModal>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-full flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-border/60 bg-muted/20 py-8'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50'>
                  Chưa có dữ liệu bữa ăn
                </p>
              </div>
            )}
          </div>

          {meal.notes && meal.notes.trim() !== '' && (
            <div className='relative mx-2 mt-3 rounded-[20px] bg-muted/40 p-3.5'>
              <div className='flex items-start gap-3'>
                <HiOutlineClipboardList
                  className='mt-0.5 text-primary/50'
                  size={16}
                />
                <p className='text-[12px] italic leading-snug text-muted-foreground'>
                  {meal.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      <Link
        to={`/schedules/day/${schedule._id}/nutrition`}
        className='group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-primary py-5 text-[13px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 active:scale-95'
      >
        <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]' />
        <span>Báo cáo dinh dưỡng</span>
        <HiOutlineChevronRight size={18} />
      </Link>
    </div>
  );
}
