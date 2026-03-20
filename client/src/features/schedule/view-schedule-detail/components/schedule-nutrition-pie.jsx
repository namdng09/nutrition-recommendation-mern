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
    <div className='relative overflow-hidden rounded-[38px] border border-border/40 bg-card p-6 transition-all hover:shadow-lg sm:p-8'>
      <div className='mb-8 flex items-center justify-between px-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm'>
            <FaDrumstickBite size={20} />
          </div>
          <div>
            <h2 className='text-[15px] font-black uppercase tracking-[0.15em] text-foreground'>
              Dinh dưỡng trong ngày
            </h2>
            <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50'>
              Chỉ số tính theo gram (g)
            </p>
          </div>
        </div>
      </div>

      <div className='relative h-[320px] w-full rounded-[32px] p-4 dark:bg-muted/10 sm:h-[360px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data.length ? data : EMPTY_SCHEDULE_PIE_DATA}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              cornerRadius={8}
              label={({ name, value }) =>
                value > 0 ? `${name}: ${formatGram(value)}g` : ''
              }
            ></Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
              formatter={v => `${formatGram(v)}g`}
            />
            {data.length ? (
              <Legend
                verticalAlign='bottom'
                iconType='circle'
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
            ) : null}
          </PieChart>
        </ResponsiveContainer>

        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>
          <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
            Tổng
          </p>
          <p className='text-xl font-black text-foreground'>
            {formatGram(
              nutrients.protein + nutrients.carbs + (nutrients.fat || 0)
            )}
            g
          </p>
        </div>
      </div>

      <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='group flex flex-col items-center justify-center rounded-[28px] bg-[#1B4332] p-5 text-white shadow-lg shadow-[#1B4332]/20 transition-all hover:brightness-110'>
          <div className='mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md'>
            <FaFireAlt className='text-orange-400' size={18} />
          </div>
          <p className='text-[10px] font-bold uppercase tracking-widest opacity-60'>
            Năng lượng
          </p>
          <div className='mt-1 flex items-baseline gap-1'>
            <span className='text-2xl font-black tracking-tighter'>
              {Math.round(nutrients.calories)}
            </span>
            <span className='text-[10px] font-bold opacity-40 uppercase'>
              kcal
            </span>
          </div>
        </div>

        <div className='group flex flex-col items-center justify-center rounded-[28px] border border-green-100 bg-green-50/50 p-5 transition-all hover:bg-white hover:shadow-md dark:border-green-900/20 dark:bg-green-950/10'>
          <div className='mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm dark:bg-card'>
            <FaDrumstickBite size={18} />
          </div>
          <p className='text-[10px] font-bold uppercase tracking-widest text-green-700/50'>
            Chất đạm
          </p>
          <div className='mt-1 text-xl font-black text-[#1B4332] dark:text-green-400'>
            {formatGram(nutrients.protein)}g
          </div>
        </div>

        <div className='group flex flex-col items-center justify-center rounded-[28px] border border-cyan-100 bg-cyan-50/50 p-5 transition-all hover:bg-white hover:shadow-md dark:border-cyan-900/20 dark:bg-cyan-950/10'>
          <div className='mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm dark:bg-card'>
            <FaBreadSlice size={18} />
          </div>
          <p className='text-[10px] font-bold uppercase tracking-widest text-cyan-700/50'>
            Tinh bột
          </p>
          <div className='mt-1 text-xl font-black text-cyan-900 dark:text-cyan-400'>
            {formatGram(nutrients.carbs)}g
          </div>
        </div>
      </div>
    </div>
  );
}
