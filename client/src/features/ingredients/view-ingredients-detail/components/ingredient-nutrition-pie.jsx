import React, { useMemo } from 'react';
import { FaDrumstickBite, FaEllipsisH, FaTint } from 'react-icons/fa';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  buildNutritionPieData,
  EMPTY_PIE_DATA,
  formatGram,
  getOtherNutrition
} from '~/lib/utils';

export default function IngredientNutritionPie({ item }) {
  const data = useMemo(() => buildNutritionPieData(item), [item]);

  return (
    <div className='rounded-2xl border border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-5 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-base font-semibold text-foreground'>
          <FaDrumstickBite className='h-4 w-4 text-primary' />
          Dinh dưỡng
        </h2>
        <span className='text-xs text-muted-foreground'>gram (g)</span>
      </div>

      <div className='h-69 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data.length ? data : EMPTY_PIE_DATA}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              outerRadius={90}
              label={({ name, value }) =>
                name !== 'Trống' && value > 0
                  ? `${name}: ${formatGram(value)}g`
                  : ''
              }
              stroke='hsl(var(--border))'
              strokeWidth={1}
            />
            <Tooltip
              formatter={value => `${formatGram(value)}g`}
              contentStyle={{ display: data.length ? 'block' : 'none' }}
            />
            {data.length ? <Legend /> : null}
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className='mt-4 grid grid-cols-3 gap-2 text-sm'>
        {/* Protein */}
        <div className='rounded-xl border border-border p-3'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <FaDrumstickBite className='h-4 w-4 text-primary' />
            <span>Đạm (Protein)</span>
          </div>
          <div className='mt-2 text-2xl font-bold text-foreground'>
            {formatGram(item?.protein)}g
          </div>
        </div>

        {/* Fat */}
        <div className='rounded-xl border border-border p-3'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <FaTint className='h-4 w-4 text-primary' />
            <span>Chất béo (Fat)</span>
          </div>
          <div className='mt-2 text-2xl font-bold text-foreground'>
            {formatGram(item?.fat)}g
          </div>
        </div>

        {/* Other */}
        <div className='rounded-xl border border-border p-3'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <FaEllipsisH className='h-4 w-4 text-primary' />
            <span>Khác</span>
          </div>
          <div className='mt-2 text-2xl font-bold text-foreground'>
            {formatGram(getOtherNutrition(item))}g
          </div>
        </div>
      </div>
    </div>
  );
}
