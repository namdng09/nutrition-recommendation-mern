import {
  HiFire,
  HiOutlineChevronRight,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineDotsVertical,
  HiOutlinePlus
} from 'react-icons/hi';
import { Link } from 'react-router';

import { cn } from '~/lib/utils';

import AddFoodModal from './add-food-modal';
import DeleteDishModal from './delete-dish-modal';

export default function DayScheduleContent({
  schedule,
  isDayToday,
  isCreating,
  handleCreate,
  getSmallMealIcon
}) {
  if (schedule) {
    return (
      <div className='space-y-4'>
        {schedule.meals.map(meal => (
          <div
            key={meal._id}
            className={cn(
              'group rounded-[32px] border p-5 transition-all duration-200',
              isDayToday
                ? 'border-primary/20 bg-card shadow-sm'
                : 'border-border/60 bg-muted/20'
            )}
          >
            <div className='flex items-center justify-between mb-5 px-1'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-inner text-xl'>
                  {getSmallMealIcon(meal.mealType)}
                </div>

                <h5 className='text-sm font-black uppercase tracking-widest text-foreground/80'>
                  {meal.mealType}
                </h5>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded-full'>
                  {meal.dishes.length} món
                </span>

                <AddFoodModal
                  mealType={meal.mealType}
                  scheduleId={schedule._id}
                  scheduleMeals={schedule.meals}
                >
                  <button className='flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-colors'>
                    <HiOutlineDotsVertical size={16} />
                  </button>
                </AddFoodModal>
              </div>
            </div>

            <div className='space-y-4'>
              {meal.dishes.length > 0 ? (
                meal.dishes.map(dish => (
                  <div key={dish._id} className='relative group'>
                    <Link
                      to={`/dishes/${dish.dishId}`}
                      className='relative flex flex-col overflow-hidden rounded-[24px] border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow'
                    >
                      <div className='relative h-28 w-full overflow-hidden'>
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className='h-full w-full object-cover'
                        />
                        <div className='absolute bottom-2 right-2 rounded-full bg-destructive px-2.5 py-1 text-[9px] font-black text-white shadow-lg uppercase'>
                          {dish.servings} khẩu phần
                        </div>
                      </div>

                      <div className='p-3.5'>
                        <h4 className='text-[13px] font-black text-foreground mb-1 uppercase tracking-tight'>
                          {dish.name}
                        </h4>
                        <div className='flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground'>
                          <HiFire className='text-destructive' size={14} />
                          <span>{dish.calories} kcal</span>
                        </div>
                      </div>
                    </Link>

                    <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition'>
                      <DeleteDishModal
                        scheduleId={schedule._id}
                        mealType={meal.mealType}
                        dishId={dish.dishId}
                      >
                        <button className='rounded-full bg-white/90 p-1.5 shadow'>
                          <HiOutlineCog size={16} />
                        </button>
                      </DeleteDishModal>
                    </div>
                  </div>
                ))
              ) : (
                <div className='py-4 text-center text-[11px] italic text-muted-foreground/40'>
                  Chưa có món ăn...
                </div>
              )}
            </div>

            {meal.notes && meal.notes.trim() !== '' && (
              <div
                className='
                  group mt-4 relative overflow-hidden
                  rounded-[20px] border-2 border-primary/10
                  bg-primary/3
                  px-4 py-3.5
                  transition-all duration-300
                '
              >
                <div className='absolute left-0 top-0 bottom-0 w-1 bg-primary/20' />

                <div className='flex gap-3'>
                  <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <HiOutlineClipboardList size={14} />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-primary/60 mb-0.5'>
                      Ghi chú bữa ăn
                    </p>
                    <p className='text-[13px] font-medium text-foreground/80 leading-relaxed italic'>
                      "{meal.notes}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <button className='mt-2 w-full flex items-center justify-center gap-2 rounded-[20px] bg-background border border-border py-4 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:bg-muted/50 transition-all'>
          CHI TIẾT <HiOutlineChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className='flex-1 flex flex-col items-center justify-center
      rounded-[32px] p-8
      border-2 border-dashed border-border
      bg-muted/40
      hover:border-primary/40 transition-all'
    >
      <p
        className='text-[11px] font-black uppercase tracking-[0.2em] mb-6
        text-muted-foreground'
      >
        Trống lịch
      </p>

      <button
        disabled={isCreating}
        onClick={handleCreate}
        className='flex flex-col items-center gap-4
        transition-transform hover:scale-105'
      >
        <div
          className='h-16 w-16 rounded-full
          bg-card
          flex items-center justify-center
          border border-border
          shadow-md
          hover:bg-primary hover:text-primary-foreground
          transition-all'
        >
          {isCreating ? (
            <div className='h-6 w-6 border-2 border-current border-t-transparent animate-spin rounded-full' />
          ) : (
            <HiOutlinePlus size={32} />
          )}
        </div>

        <button disabled={!!schedule || isCreating} onClick={handleCreate}>
          Lên kế hoạch
        </button>
      </button>
    </div>
  );
}
