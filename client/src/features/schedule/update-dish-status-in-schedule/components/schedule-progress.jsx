import { HiFire } from 'react-icons/hi';

export default function ScheduleProgress({ schedule }) {
  const allDishes = schedule.meals.flatMap(meal => meal.dishes);

  const eatenDishes = allDishes.filter(dish => dish.isEaten);
  const eatenCount = eatenDishes.length;
  const totalDishes = allDishes.length;

  const eatenCalories = eatenDishes.reduce(
    (total, dish) => total + (Number(dish.energy) || 0),
    0
  );

  const percent = totalDishes
    ? Math.round((eatenCount / totalDishes) * 100)
    : 0;

  return (
    <div className='mb-8 space-y-2.5'>
      <div className='flex items-center justify-between text-xs font-bold text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <HiFire className='text-orange-500' size={14} />
          Tiến độ hôm nay
        </span>

        <span>{percent}%</span>
      </div>

      <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className='h-full bg-primary transition-all duration-300'
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className='flex items-center justify-between text-[11px] font-medium text-muted-foreground'>
        <span>
          Đã ăn <b className='text-foreground'>{eatenCount}</b> /{' '}
          <b className='text-foreground'>{totalDishes}</b> món
        </span>

        <span>
          <b className='text-foreground'>{eatenCalories}</b> kcal
        </span>
      </div>
    </div>
  );
}
