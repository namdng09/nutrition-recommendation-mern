import React from 'react';
import { FaFireAlt } from 'react-icons/fa';

export default function IngredientCalories({ calories }) {
  return (
    <div className='mb-4 flex justify-between rounded-xl bg-orange-50/50 p-3 ring-1 ring-orange-100/50'>
      <div className='flex items-center gap-2 text-orange-700'>
        <FaFireAlt />
        <span className='text-xs font-bold uppercase'>Calories</span>
      </div>

      <span className='font-black text-orange-900'>
        {calories.value} {calories.unit}
      </span>
    </div>
  );
}
