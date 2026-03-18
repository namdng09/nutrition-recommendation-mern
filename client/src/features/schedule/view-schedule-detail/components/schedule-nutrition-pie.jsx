import React, { useMemo } from 'react';
import { FaBreadSlice, FaDrumstickBite, FaFireAlt } from 'react-icons/fa';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  buildScheduleNutritionPieData,
  EMPTY_SCHEDULE_PIE_DATA,
  findByLabel,
  formatGram
} from '~/lib/utils';

export default function ScheduleNutritionPie({ schedule }) {
  const nutrients = useMemo(() => {
    const list = schedule?.totalNutrition?.nutrients || [];

    return {
      calories: findByLabel(list, 'Năng lượng')?.value ?? 0,
      protein: findByLabel(list, 'Protein')?.value ?? 0,
      carbs: findByLabel(list, 'Tinh bột')?.value ?? 0,
      fat: findByLabel(list, 'Chất béo')?.value ?? 0
    };
  }, [schedule]);

  const data = useMemo(
    () =>
      buildScheduleNutritionPieData({
        protein: { value: nutrients.protein },
        carbs: { value: nutrients.carbs },
        fat: { value: nutrients.fat }
      }),
    [nutrients]
  );

  return (
    <div className='rounded-2xl border bg-card p-5 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-sm font-black tracking-wide'>
          <FaDrumstickBite className='text-primary' />
          DINH DƯỠNG TRONG NGÀY
        </h2>
        <span className='text-[10px] text-muted-foreground'>gram (g)</span>
      </div>

      <div className='h-[320px] w-full sm:h-[360px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data.length ? data : EMPTY_SCHEDULE_PIE_DATA}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              outerRadius={90}
              label={({ name, value }) =>
                value > 0 ? `${name}: ${formatGram(value)}g` : ''
              }
            />
            <Tooltip formatter={v => `${formatGram(v)}g`} />
            {data.length ? <Legend verticalAlign='bottom' /> : null}
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs'>
        <div className='rounded-xl border p-3 text-center text-orange-light'>
          <div className='flex items-center justify-center gap-1 font-semibold'>
            <FaFireAlt className='text-lg' />
            <span>Calo</span>
          </div>
          <div className='mt-1 text-lg font-black'>
            {Math.round(nutrients.calories)} kcal
          </div>
        </div>

        <div className='rounded-xl border p-3 text-center text-green-light'>
          <div className='flex items-center justify-center gap-1 font-semibold'>
            <FaDrumstickBite className='text-lg' />
            <span>Đạm</span>
          </div>
          <div className='mt-1 text-lg font-black'>
            {formatGram(nutrients.protein)}g
          </div>
        </div>

        <div className='rounded-xl border p-3 text-center text-cyan-light'>
          <div className='flex items-center justify-center gap-1 font-semibold'>
            <FaBreadSlice className='text-lg' />
            <span>Tinh bột</span>
          </div>
          <div className='mt-1 text-lg font-black'>
            {formatGram(nutrients.carbs)}g
          </div>
        </div>
      </div>
    </div>
  );
}
