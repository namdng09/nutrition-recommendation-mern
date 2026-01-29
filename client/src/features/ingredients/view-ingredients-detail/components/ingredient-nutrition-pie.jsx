import React, { useMemo } from 'react';
import {
  FaDrumstickBite,
  FaEllipsisH,
  FaFireAlt,
  FaTint
} from 'react-icons/fa';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  buildNutritionPieData,
  EMPTY_PIE_DATA,
  formatGram,
  getOtherNutrition
} from '~/lib/utils';

export default function IngredientNutritionPie({ item }) {
  const nutrients = item?.nutrition?.nutrients || {};
  const data = useMemo(() => buildNutritionPieData(nutrients), [nutrients]);

  return (
    <div className='h-full rounded-2xl border border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-5 shadow-sm flex flex-col'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-base font-semibold text-foreground'>
          <FaDrumstickBite className='h-4 w-4 text-primary' />
          Dinh dưỡng
        </h2>
        <span className='text-xs text-muted-foreground'>gram (g)</span>
      </div>

      <div className='flex-1 w-full min-h-[320px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data.length ? data : EMPTY_PIE_DATA}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              outerRadius={95}
              label={({ name, value }) =>
                name !== 'Trống' && value > 0
                  ? `${name}: ${formatGram(value)}g`
                  : ''
              }
              stroke='hsl(var(--border))'
              strokeWidth={1}
            />
            <Tooltip formatter={v => `${formatGram(v)}g`} />
            {data.length ? <Legend /> : null}
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className='mt-auto grid grid-cols-3 gap-2 text-sm'>
        <div className='rounded-xl border border-border p-3'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <FaFireAlt className='h-4 w-4 text-orange-500' />
            <span>Calo</span>
          </div>
          <div className='mt-2 text-2xl font-bold text-foreground'>
            {nutrients.calories?.value ?? 0} kcal
          </div>
        </div>

        <div className='rounded-xl border border-border p-3'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <FaDrumstickBite className='h-4 w-4 text-emerald-600' />
            <span>Đạm</span>
          </div>
          <div className='mt-2 text-2xl font-bold text-foreground'>
            {formatGram(nutrients.protein?.value)}g
          </div>
        </div>

        <div className='rounded-xl border border-border p-3'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <FaEllipsisH className='h-4 w-4 text-sky-600' />
            <span>Khác</span>
          </div>
          <div className='mt-2 text-2xl font-bold text-foreground'>
            {formatGram(getOtherNutrition(nutrients))}g
          </div>
        </div>
      </div>
    </div>
  );
}
