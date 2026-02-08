import {
  HiFire,
  HiOutlineChevronRight,
  HiOutlineClipboardList,
  HiOutlineDotsVertical,
  HiOutlinePhotograph,
  HiOutlineTrash,
  HiOutlineUserGroup
} from 'react-icons/hi';
import { IoCafe, IoFastFood, IoLeaf, IoMoon, IoSunny } from 'react-icons/io5';
import { Link } from 'react-router';

import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { formatDateVI } from '~/lib/utils';

import DeleteScheduleModal from '../../delete-schedule/components/delete-schedule-modal';
import DishCheckin from '../../update-dish-status-in-schedule/components/dish-check-in';
import ScheduleProgress from '../../update-dish-status-in-schedule/components/schedule-progress';
import AddFoodModal from './add-food-modal';
import DeleteDishModal from './delete-dish-modal';

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
      <div className='mb-4 flex items-center justify-between px-1'>
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
            <div className='flex flex-col items-end gap-0.5'>
              <span className='text-[10px] font-black uppercase tracking-[0.2em] text-[#2D6A4F]/60 px-1'>
                Mục tiêu ngày
              </span>

              <Link
                to={`/profile/nutrition-target`}
                className='flex items-center gap-1.5 rounded-full border border-[#2D6A4F]/20 bg-[#F0F7F4] px-3 py-1 shadow-sm'
              >
                <HiFire className='text-[#2D6A4F]' size={14} />
                <span className='text-[12px] font-black tracking-tight text-[#1B4332]'>
                  {targetCalories}{' '}
                  <span className='text-[9px] font-bold opacity-60'>kcal</span>
                </span>
              </Link>
            </div>
          )}

          <DeleteScheduleModal scheduleId={schedule._id}>
            <button
              className='flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all'
              title='Xoá toàn bộ lịch ăn'
            >
              <HiOutlineTrash size={18} />
            </button>
          </DeleteScheduleModal>
        </div>
      </div>

      <ScheduleProgress schedule={schedule} />

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
                  <div
                    key={dish._id}
                    className='relative group flex items-center gap-3'
                  >
                    <DishCheckin
                      scheduleId={schedule._id}
                      mealType={meal.mealType}
                      dish={dish}
                    />

                    <Link
                      to={`/dishes/${dish.dishId}`}
                      className='flex-1 flex items-center gap-4 p-3 rounded-2xl border border-border/50 bg-background/50 hover:bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200'
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
                            <b className='text-foreground/80'>
                              {dish.calories}
                            </b>
                            kcal
                          </span>

                          <span className='flex items-center gap-1'>
                            <HiOutlineUserGroup size={14} />
                            <b className='text-foreground/80'>
                              {dish.servings}
                            </b>
                            phần
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition'>
                      <DeleteDishModal
                        scheduleId={schedule._id}
                        mealType={meal.mealType}
                        dishId={dish.dishId}
                      >
                        <button
                          className='flex h-7 w-7 items-center justify-center rounded-full 
             bg-destructive text-white shadow 
             hover:scale-110 hover:bg-destructive/90 transition'
                          title='Xoá món'
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      </DeleteDishModal>
                    </div>
                  </div>
                ))
              ) : (
                <div className='ml-1 text-[11px] italic text-muted-foreground/50'>
                  Chưa có món ăn cho {meal.mealType.toLowerCase()}...
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
      </div>

      <button className='mt-10 w-full flex items-center justify-center gap-2 rounded-[20px] bg-primary py-4 text-[12px] font-black tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all'>
        PHÂN TÍCH DINH DƯỠNG
        <HiOutlineChevronRight size={16} />
      </button>
    </div>
  );
}
