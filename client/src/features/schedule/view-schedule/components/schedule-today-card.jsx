import {
  HiChevronRight,
  HiFire,
  HiOutlineChevronRight,
  HiOutlineClipboardList,
  HiOutlineDotsVertical,
  HiOutlineUserGroup
} from 'react-icons/hi';
import { IoCafe, IoFastFood, IoLeaf, IoMoon, IoSunny } from 'react-icons/io5';
import { Link } from 'react-router';

import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { formatDateVI } from '~/lib/utils';

import AddFoodModal from './add-food-modal';

const MEAL_CONFIG = {
  sáng: { icon: <IoCafe className='text-orange-400' /> },
  trưa: { icon: <IoSunny className='text-amber-500' /> },
  tối: { icon: <IoMoon className='text-indigo-400' /> },
  nhẹ: { icon: <IoFastFood className='text-emerald-500' /> },
  default: { icon: <IoLeaf className='text-slate-400' /> }
};

const getMealIcon = (type = '') => {
  const t = type.toLowerCase();
  const key = Object.keys(MEAL_CONFIG).find(k => t.includes(k));
  return MEAL_CONFIG[key || 'default'].icon;
};

export default function ScheduleTodayCard({ schedule, selectedDate }) {
  const { data: profile } = useProfileForPage();
  const targetCalories = profile?.nutritionTarget?.caloriesTarget ?? undefined;

  return (
    <div className='rounded-[32px] border border-border bg-card p-6 shadow-sm'>
      <div className='mb-8 flex items-center justify-between px-1'>
        <div>
          <h2 className='text-2xl font-black tracking-tight text-foreground'>
            {formatDateVI(selectedDate)}
          </h2>
          <p className='mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60'>
            Lịch trình ăn uống
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {targetCalories && (
            <div className='flex flex-col items-end'>
              <div className='flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-black text-destructive'>
                <HiFire size={14} />
                {targetCalories} kcal
              </div>
            </div>
          )}

          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary shadow-inner'>
            <HiOutlineClipboardList size={24} />
          </div>
        </div>
      </div>

      <div className='space-y-8'>
        {schedule.meals.map(meal => (
          <div key={meal._id} className='relative'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl border border-primary/10'>
                  {getMealIcon(meal.mealType)}
                </span>
                <h5 className='text-sm font-black uppercase tracking-wider text-foreground'>
                  {meal.mealType}
                </h5>
              </div>

              <AddFoodModal
                mealType={meal.mealType}
                scheduleId={schedule._id}
                scheduleMeals={schedule.meals}
              >
                <button className='p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors'>
                  <HiOutlineDotsVertical size={18} />
                </button>
              </AddFoodModal>
            </div>

            <div className='space-y-3'>
              {meal.dishes.length > 0 ? (
                meal.dishes.map(dish => (
                  <Link
                    key={dish._id}
                    to={`/dishes/${dish.dishId}`}
                    className='
      group flex items-center gap-4 p-3
      rounded-2xl border border-border/50
      bg-background/50
      hover:bg-card hover:border-primary/30 hover:shadow-sm
      transition-all duration-200
    '
                  >
                    <div className='h-14 w-14 shrink-0 overflow-hidden rounded-[16px] border border-border bg-muted'>
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className='h-full w-full object-cover transition-transform group-hover:scale-105'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center'>
                          <HiOutlinePhotograph
                            className='text-muted-foreground/30'
                            size={20}
                          />
                        </div>
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <h4 className='truncate text-[14px] font-bold text-foreground leading-tight'>
                        {dish.name}
                      </h4>

                      <div className='mt-1.5 flex items-center gap-4 text-[11px] font-medium text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <HiFire className='text-destructive/70' size={14} />
                          <b className='text-foreground/80'>{dish.calories}</b>
                          kcal
                        </span>

                        <span className='flex items-center gap-1'>
                          <HiOutlineUserGroup size={14} />
                          <b className='text-foreground/80'>{dish.servings}</b>
                          phần
                        </span>
                      </div>
                    </div>

                    <HiChevronRight
                      className='pr-1 text-muted-foreground/20 transition-colors group-hover:text-primary'
                      size={18}
                    />
                  </Link>
                ))
              ) : (
                <div className='ml-1 text-[11px] italic text-muted-foreground/50'>
                  Chưa có món ăn cho {meal.mealType.toLowerCase()}...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className='mt-10 w-full flex items-center justify-center gap-2 rounded-[20px] bg-primary py-4 text-[12px] font-black tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all'>
        PHÂN TÍCH DINH DƯỠNG
        <HiOutlineChevronRight size={16} />
      </button>
    </div>
  );
}
