import React, { useMemo } from 'react';
import { FaDrumstickBite, FaEllipsisH, FaFireAlt } from 'react-icons/fa';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  buildNutritionPieData,
  EMPTY_PIE_DATA,
  findByLabel,
  formatGram,
  getOtherNutrition
} from '~/lib/utils';

export default function IngredientNutritionPie({ item }) {
  const list = item?.nutrition?.nutrients || [];

  const nutrients = {
    protein: findByLabel(list, 'Protein'),
    fat: findByLabel(list, 'Chất béo'),
    carbs: findByLabel(list, 'Tinh bột'),
    fiber: findByLabel(list, 'Chất xơ'),
    calories: findByLabel(list, 'Năng lượng')
  };
  const data = useMemo(() => buildNutritionPieData(nutrients), [nutrients]);

  return (
    <div className='h-full rounded-[38px] border border-border/40 bg-card p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)]'>
      <div className='mb-6 flex items-center justify-between px-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm'>
            <FaDrumstickBite size={18} />
          </div>
          <h2 className='text-[15px] font-black uppercase tracking-[0.15em] text-foreground'>
            Dinh dưỡng
          </h2>
        </div>
        <span className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40'>
          Đơn vị: gram (g)
        </span>
      </div>

      <div className='relative flex-1 w-full min-h-[320px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data.length ? data : EMPTY_PIE_DATA}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              innerRadius={80}
              outerRadius={110}
              paddingAngle={8}
              cornerRadius={12}
              stroke='none'
              label={({ name, value }) =>
                name !== 'Trống' && value > 0
                  ? `${name}: ${formatGram(value)}g`
                  : ''
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                padding: '12px 16px'
              }}
              formatter={v => `${formatGram(v)}g`}
            />
            {data.length ? (
              <Legend
                verticalAlign='bottom'
                iconType='circle'
                iconSize={8}
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              />
            ) : null}
          </PieChart>
        </ResponsiveContainer>

        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none'>
          <p className='text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30'>
            Tổng nạp
          </p>
          <p className='text-2xl font-black text-foreground tracking-tighter'>
            {formatGram(data.reduce((acc, curr) => acc + (curr.value || 0), 0))}
            <span className='text-[10px] ml-0.5 opacity-30'>g</span>
          </p>
        </div>
      </div>

      <div className='mt-auto grid grid-cols-3 gap-3 pt-6'>
        <div className='flex flex-col items-center justify-center rounded-[24px] border border-orange-500/10 bg-orange-500/[0.02] p-4 transition-all hover:bg-orange-500/[0.05] dark:border-orange-500/20'>
          <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1B4332] text-orange-400 shadow-lg shadow-[#1B4332]/20'>
            <FaFireAlt size={18} />
          </div>
          <p className='text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-center'>
            Calo
          </p>
          <div className='mt-1 flex items-baseline gap-1'>
            <span className='text-xl font-black tracking-tighter text-foreground'>
              {nutrients.calories?.value ?? 0}
            </span>
            <span className='text-[8px] font-bold opacity-30 uppercase'>
              kcal
            </span>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center rounded-[24px] border border-emerald-600/10 bg-emerald-600/[0.02] p-4 transition-all hover:bg-emerald-600/[0.05] dark:border-emerald-600/20'>
          <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary dark:bg-muted/50 text-emerald-600'>
            <FaDrumstickBite size={18} />
          </div>
          <p className='text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-center'>
            Chất Đạm
          </p>
          <div className='mt-1 text-xl font-black text-foreground tracking-tighter'>
            {formatGram(nutrients.protein?.value)}
            <span className='text-[9px] ml-0.5 opacity-30'>g</span>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center rounded-[24px] border border-sky-600/10 bg-sky-600/[0.02] p-4 transition-all hover:bg-sky-600/[0.05] dark:border-sky-600/20'>
          <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary dark:bg-muted/50 text-sky-600'>
            <FaEllipsisH size={18} />
          </div>
          <p className='text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-center'>
            Khác
          </p>
          <div className='mt-1 text-xl font-black text-foreground tracking-tighter'>
            {formatGram(getOtherNutrition(nutrients))}
            <span className='text-[9px] ml-0.5 opacity-30'>g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
