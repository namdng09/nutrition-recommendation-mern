import {
  HiFire,
  HiLightningBolt,
  HiOutlineChevronRight,
  HiOutlineClipboardList,
  HiOutlineDotsVertical,
  HiOutlineUserGroup
} from 'react-icons/hi';
import { IoCafe, IoFastFood, IoLeaf, IoMoon, IoSunny } from 'react-icons/io5';

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
  return (
    <div className='rounded-[32px] border border-border bg-card p-6 shadow-sm'>
      <div className='mb-6 flex items-center justify-between border-b border-border pb-5 px-1'>
        <div>
          <h4 className='text-xs font-black uppercase tracking-widest mb-1 text-muted-foreground'>
            Thực đơn hôm nay
          </h4>
          <h2 className='text-xl font-black capitalize text-foreground'>
            {formatDateVI(selectedDate)}
          </h2>
        </div>

        <div className='h-11 w-11 rounded-2xl bg-accent flex items-center justify-center text-primary shadow-inner'>
          <HiOutlineClipboardList size={22} />
        </div>
      </div>

      <div className='space-y-3'>
        {schedule.meals.map(meal => (
          <div
            key={meal._id}
            className='group flex gap-4 rounded-[20px] p-4 bg-muted/40 border border-transparent transition-all hover:bg-card hover:border-border hover:shadow-md'
          >
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-sm'>
              <div className='text-xl text-primary'>
                {getMealIcon(meal.mealType)}
              </div>
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <h5 className='text-[13px] font-black uppercase tracking-tight text-foreground'>
                  {meal.mealType}
                </h5>

                <div className='flex items-center gap-1 text-[9px] font-bold text-primary bg-accent px-2 py-0.5 rounded-full border border-primary/20 shadow-sm'>
                  <HiLightningBolt size={10} />
                  {meal.dishes.length}
                </div>
              </div>

              <div className='mt-3 space-y-3'>
                {meal.dishes.length > 0 ? (
                  meal.dishes.map(dish => (
                    <div
                      key={dish._id}
                      className='flex items-center gap-4 rounded-2xl bg-card border border-border p-3'
                    >
                      {dish.image && (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className='h-12 w-12 rounded-xl object-cover border border-border shrink-0'
                        />
                      )}

                      <div className='flex-1 min-w-0'>
                        <p className='text-[12px] font-black text-foreground truncate'>
                          {dish.name}
                        </p>

                        <div className='mt-1 flex items-center gap-4 text-[10px] font-bold text-muted-foreground'>
                          {typeof dish.calories === 'number' && (
                            <span className='flex items-center gap-1'>
                              <HiFire className='text-destructive' size={14} />
                              {dish.calories} kcal
                            </span>
                          )}

                          {dish.servings && (
                            <span className='flex items-center gap-1'>
                              <HiOutlineUserGroup size={14} />
                              {dish.servings} khẩu phần
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className='text-[11px] italic text-muted-foreground'>
                    Chưa có món ăn...
                  </span>
                )}
              </div>
            </div>

            <AddFoodModal>
              <button className='self-start mt-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-colors'>
                <HiOutlineDotsVertical size={18} />
              </button>
            </AddFoodModal>
          </div>
        ))}
      </div>

      <button className='mt-6 w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[11px] font-black tracking-[0.1em] bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/30'>
        PHÂN TÍCH DINH DƯỠNG
        <HiOutlineChevronRight size={14} />
      </button>
    </div>
  );
}
