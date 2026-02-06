import { HiFire } from 'react-icons/hi';

export default function ScheduleProgress({ schedule }) {
  const allDishes = schedule.meals.flatMap(m => m.dishes);
  const eatenCount = allDishes.filter(d => d.isEaten).length;
  const percent = allDishes.length
    ? Math.round((eatenCount / allDishes.length) * 100)
    : 0;

  return (
    <div className='mb-8 space-y-2'>
      <div className='flex justify-between items-center text-xs font-bold text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <HiFire className='text-orange-500' size={14} />
          Tiến độ hôm nay
        </span>
        <span>{percent}%</span>
      </div>

      <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
        <div
          className='h-full bg-primary transition-all'
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
