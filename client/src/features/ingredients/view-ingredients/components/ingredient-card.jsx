import React from 'react';
import { FaChartPie, FaFireAlt, FaLeaf, FaWind } from 'react-icons/fa';

import MacroItem from './macro-item';

export default function IngredientCard({ item }) {
  const nutrients = item?.nutrition?.nutrients || {};

  return (
    <div className='group relative overflow-hidden rounded-[1.75rem] border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)]'>
      <div className='flex items-center gap-4 mb-5'>
        <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary/30'>
          <img
            src={item.image || '/placeholder.png'}
            alt={item.name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
            loading='lazy'
          />
          <div className='absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100' />
        </div>

        <div className='min-w-0 flex-1 space-y-1.5'>
          <div className='flex items-center justify-between gap-2'>
            <h3 className='truncate text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-emerald-600'>
              {item.name}
            </h3>
          </div>

          <div className='flex items-center gap-2'>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ring-1 ${
                item.isActive
                  ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                  : 'bg-zinc-100 text-zinc-400 ring-zinc-200'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}
              />
              {item.isActive ? 'Đang hoạt động' : 'Vô hiệu hoá'}
            </span>
            <span className='text-[11px] font-semibold text-muted-foreground'>
              {item.baseUnit?.amount}
              {item.baseUnit?.unit}
            </span>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between rounded-xl bg-orange-50/50 p-3 ring-1 ring-orange-100/50'>
          <div className='flex items-center gap-2 text-orange-700'>
            <FaFireAlt className='text-sm' />
            <span className='text-xs font-bold uppercase tracking-wider'>
              Calories
            </span>
          </div>
          <span className='text-sm font-black text-orange-900'>
            {nutrients.calories?.value ?? '--'} {nutrients.calories?.unit}
          </span>
        </div>

        <div className='grid grid-cols-3 gap-3'>
          <MacroItem
            label='Đạm'
            value={nutrients.protein?.value}
            color='bg-emerald-500'
            icon={<FaLeaf className='text-emerald-500' />}
          />
          <MacroItem
            label='Tinh bột'
            value={nutrients.carbs?.value}
            color='bg-sky-500'
            icon={<FaChartPie className='text-sky-500' />}
          />
          <MacroItem
            label='Béo'
            value={nutrients.fat?.value}
            color='bg-amber-500'
            icon={<FaWind className='text-amber-500' />}
          />
        </div>
      </div>
    </div>
  );
}
