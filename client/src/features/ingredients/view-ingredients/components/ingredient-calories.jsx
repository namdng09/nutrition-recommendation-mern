import React from 'react';
import { FaFireAlt } from 'react-icons/fa';

export default function IngredientCalories({ calories }) {
  return (
    <div className='mb-5 flex items-center justify-between rounded-[1.25rem] bg-orange-50 px-4 py-3.5 shadow-sm ring-1 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/20'>
      <div className='flex items-center gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm dark:bg-background/60 dark:text-orange-400'>
          <FaFireAlt />
        </div>

        <div className='flex flex-col'>
          <span className='text-[10px] font-black uppercase tracking-[0.16em] text-orange-700/70 dark:text-orange-300/70'>
            Calories
          </span>
          <span className='text-sm font-bold text-orange-800 dark:text-orange-200'>
            Năng lượng
          </span>
        </div>
      </div>

      <span className='text-lg font-black tracking-tight text-orange-900 dark:text-orange-100'>
        {calories.value} {calories.unit}
      </span>
    </div>
  );
}
