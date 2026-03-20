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
          <div className='flex items-center justify-between mb-4 px-2'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-primary/10 to-primary/5 text-2xl shadow-inner'>
                {getSmallMealIcon(meal.mealType)}
              </div>
              <div>
                <h5 className='text-[15px] font-black tracking-tight text-foreground uppercase'>
                  {meal.mealType}
                </h5>
                <div className='flex items-center gap-2 mt-0.5'>
                  <span className='h-1 w-1 rounded-full bg-primary/40' />
                  <p className='text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]'>
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
              <button className='flex h-9 w-9 items-center justify-center rounded-full bg-muted/20 text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300'>
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
                    className='flex flex-col h-full overflow-hidden rounded-[28px] bg-white border border-transparent shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1'
                  >
                    <div className='relative h-36 w-full overflow-hidden'>
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className='h-full w-full object-cover transition-transform duration-700 group-hover/dish:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40' />
                      <div className='absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-black text-primary shadow-sm'>
                        <HiFire size={12} />
                        {dish.energy} kcal
                      </div>
                    </div>

                    <div className='p-4'>
                      <h4 className='truncate text-[14px] font-black text-foreground mb-1 leading-tight group-hover/dish:text-primary transition-colors'>
                        {dish.name}
                      </h4>
                      <p className='text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tighter'>
                        {dish.servings} khẩu phần
                      </p>
                    </div>
                  </Link>

                  <div className='absolute -top-1 -right-1 opacity-0 group-hover/dish:opacity-100 transition-all scale-75 group-hover/dish:scale-100'>
                    <DeleteDishModal
                      scheduleId={schedule._id}
                      mealType={meal.mealType}
                      dishId={dish.dishId}
                    >
                      <button className='flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-white shadow-xl hover:rotate-12 transition-transform'>
                        <HiOutlineTrash size={14} />
                      </button>
                    </DeleteDishModal>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-full py-8 border-2 border-dashed border-muted/30 rounded-[28px] flex flex-col items-center justify-center bg-muted/5'>
                <p className='text-[11px] font-bold text-muted-foreground/30 uppercase tracking-widest'>
                  Chưa có dữ liệu bữa ăn
                </p>
              </div>
            )}
          </div>

          {meal.notes && meal.notes.trim() !== '' && (
            <div className='mt-3 mx-2 p-3.5 rounded-[20px] bg-muted/30 border-none relative'>
              <div className='flex gap-3 items-start'>
                <HiOutlineClipboardList
                  className='text-primary/40 mt-0.5'
                  size={16}
                />
                <p className='text-[12px] font-medium text-muted-foreground italic leading-snug'>
                  {meal.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      <Link
        to={`/schedules/day/${schedule._id}/nutrition`}
        className='group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-[#1B4332] py-5 text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#1B4332]/20 transition-all hover:shadow-[#1B4332]/40 hover:-translate-y-0.5 active:scale-95'
      >
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]' />
        <span>Báo cáo dinh dưỡng</span>
        <HiOutlineChevronRight size={18} />
      </Link>
    </div>
  );
}
