import {
  HiFire,
  HiOutlineChevronRight,
  HiOutlineClipboardList,
  HiOutlineDotsVertical,
  HiOutlinePhotograph,
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiSparkles
} from 'react-icons/hi';
import { IoCafe, IoFastFood, IoLeaf, IoMoon, IoSunny } from 'react-icons/io5';
import { Link } from 'react-router';

import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { formatDateVI } from '~/lib/utils';

import DeleteScheduleModal from '../../delete-schedule/components/delete-schedule-modal';
import DishCheckin from '../../update-dish-status-in-schedule/components/dish-check-in';
import ScheduleProgress from '../../update-dish-status-in-schedule/components/schedule-progress';
import AddFoodModal from './add-food-modal';
import AITokenUsage from './ai-token-usage';
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

export default function ScheduleTodayCard({
  schedule,
  selectedDate,
  onGenerateAI,
  isGeneratingAI
}) {
  const { data: profile } = useProfileForPage();

  const targetCalories = profile?.nutritionTarget?.caloriesTarget ?? undefined;
  const remainingTokens = profile?.aiTokens;
  const dailyTokenLimit = profile?.aiDailyTokenLimit;

  return (
    <div className='rounded-[32px] border border-border bg-card p-6 shadow-sm'>
      <div className='mb-5 rounded-[28px] bg-card/70 p-4 shadow-sm backdrop-blur sm:p-5'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0'>
              <h2 className='text-2xl font-black tracking-tight text-foreground sm:text-[28px]'>
                {formatDateVI(selectedDate)}
              </h2>
              <p className='mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60'>
                Lịch trình ăn uống
              </p>
            </div>

            <div className='flex shrink-0 items-start gap-3'>
              {targetCalories && (
                <div className='flex flex-col items-end gap-1'>
                  <span className='px-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60'>
                    Mục tiêu ngày
                  </span>
                  <Link
                    to='/profile/nutrition-target'
                    className='flex items-center gap-1.5 rounded-full bg-[#F0F7F4] px-3 py-1.5 shadow-sm transition-all hover:shadow-md'
                  >
                    <HiFire className='text-[#2D6A4F]' size={14} />
                    <span className='text-[12px] font-black tracking-tight text-[#1B4332]'>
                      {targetCalories}{' '}
                      <span className='text-[9px] font-bold opacity-60'>
                        kcal
                      </span>
                    </span>
                  </Link>
                </div>
              )}

              <DeleteScheduleModal scheduleId={schedule._id}>
                <button
                  className='flex h-10 w-10 items-center justify-center rounded-xl bg-background text-destructive shadow-sm transition-all hover:bg-destructive hover:text-white hover:shadow-md'
                  title='Xoá toàn bộ lịch ăn'
                >
                  <HiOutlineTrash size={18} />
                </button>
              </DeleteScheduleModal>
            </div>
          </div>

          <div className='flex items-center justify-between gap-3 rounded-2xl bg-primary/[0.06] px-4 py-3'>
            <div className='min-w-0'>
              <p className='text-[12px] font-black tracking-tight text-primary'>
                Gợi ý thực đơn bằng AI
              </p>
              <p className='text-[11px] text-muted-foreground'>
                Tạo nhanh lịch ăn phù hợp với mục tiêu trong ngày
              </p>

              <AITokenUsage
                remainingTokens={remainingTokens}
                dailyTokenLimit={dailyTokenLimit}
              />
            </div>

            <button
              onClick={onGenerateAI}
              disabled={isGeneratingAI}
              className='flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12px] font-black tracking-tight text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isGeneratingAI ? (
                <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <HiSparkles size={14} />
              )}
              AI gợi ý
            </button>
          </div>
        </div>
      </div>

      <ScheduleProgress schedule={schedule} />

      <div className='space-y-8'>
        {schedule.meals.map(meal => (
          <div key={meal._id} className='relative'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <span className='flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-xl'>
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
                <button className='rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted'>
                  <HiOutlineDotsVertical size={18} />
                </button>
              </AddFoodModal>
            </div>

            <div className='space-y-3'>
              {meal.dishes.length > 0 ? (
                meal.dishes.map(dish => (
                  <div
                    key={dish.dishId}
                    className='group relative flex items-center gap-3'
                  >
                    <DishCheckin
                      scheduleId={schedule._id}
                      mealType={meal.mealType}
                      dish={dish}
                    />

                    <Link
                      to={`/dishes/${dish.dishId}`}
                      className='flex flex-1 items-center gap-4 rounded-2xl border border-border/50 bg-background/50 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-sm'
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

                      <div className='min-w-0 flex-1'>
                        <h4 className='truncate text-[14px] font-bold leading-tight text-foreground'>
                          {dish.name}
                        </h4>

                        <div className='mt-1.5 flex items-center gap-4 text-[11px] font-medium text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <HiFire className='text-destructive/70' size={14} />
                            <b className='text-foreground/80'>{dish.energy}</b>
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

                    <div className='absolute right-2 top-2 opacity-0 transition group-hover:opacity-100'>
                      <DeleteDishModal
                        scheduleId={schedule._id}
                        mealType={meal.mealType}
                        dishId={dish.dishId}
                      >
                        <button
                          className='flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white shadow transition hover:scale-110 hover:bg-destructive/90'
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
              <div className='group relative mt-4 overflow-hidden rounded-[20px] border-2 border-primary/10 bg-primary/3 px-4 py-3.5 transition-all duration-300'>
                <div className='absolute bottom-0 left-0 top-0 w-1 bg-primary/20' />

                <div className='flex gap-3'>
                  <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <HiOutlineClipboardList size={14} />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <p className='mb-0.5 text-[10px] font-black uppercase tracking-widest text-primary/60'>
                      Ghi chú bữa ăn
                    </p>
                    <p className='text-[13px] font-medium italic leading-relaxed text-foreground/80'>
                      "{meal.notes}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Link
        to={`/schedules/day/${schedule._id}/nutrition`}
        className='mt-10 flex w-full items-center justify-center gap-2 rounded-[20px] bg-primary py-4 text-[12px] font-black tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]'
      >
        PHÂN TÍCH DINH DƯỠNG
        <HiOutlineChevronRight size={16} />
      </Link>
    </div>
  );
}
