import { HiOutlineChevronRight, HiOutlinePlus } from 'react-icons/hi';

import { cn } from '~/lib/utils';

import DishItem from './dish-item';

export default function DayScheduleContent({
  schedule,
  isDayToday,
  isCreating,
  handleCreate,
  getSmallMealIcon
}) {
  if (schedule) {
    return (
      <div className='space-y-3'>
        {schedule.meals.map(meal => (
          <div
            key={meal._id}
            className={cn(
              `
              group flex items-center gap-4
              rounded-2xl p-3.5
              border transition-all
            `,
              isDayToday
                ? `
                border-primary/20
                bg-card
                shadow-sm
              `
                : `
                border-border
                bg-muted/40
                hover:bg-card
                hover:border-border/70
                hover:shadow-md
              `
            )}
          >
            <div
              className='flex h-10 w-10 items-center justify-center
              rounded-xl bg-card
              border border-border
              shadow-sm
              group-hover:scale-110 transition-transform'
            >
              {getSmallMealIcon(meal.mealType)}
            </div>

            <div className='flex-1 min-w-0'>
              <p
                className='text-[10px] font-black uppercase tracking-wider mb-1
                text-muted-foreground
                group-hover:text-primary transition-colors'
              >
                {meal.mealType}
              </p>

              <DishItem dishes={meal.dishes} />
            </div>
          </div>
        ))}

        <button
          className='mt-5 w-full flex items-center justify-center gap-2
          rounded-2xl py-4
          text-[11px] font-black uppercase tracking-[0.2em]
          text-muted-foreground
          border border-border
          hover:bg-primary hover:text-primary-foreground
          transition-all'
        >
          Chi tiết <HiOutlineChevronRight size={16} />
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
