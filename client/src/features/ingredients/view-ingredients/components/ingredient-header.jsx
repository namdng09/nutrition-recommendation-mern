import React from 'react';

export default function IngredientHeader({ item }) {
  return (
    <div className='mb-6 flex items-center gap-4 rounded-[1.75rem] bg-card p-4 shadow-sm ring-1 ring-border/60 sm:gap-5 sm:p-5'>
      <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/50'>
        <img
          src={item.image || '/placeholder.png'}
          alt={item.name}
          className='h-full w-full object-cover'
        />
      </div>

      <div className='min-w-0 flex-1 space-y-2'>
        <h3 className='truncate text-xl font-black tracking-tight text-foreground sm:text-2xl'>
          {item.name}
        </h3>

        <div className='flex flex-wrap items-center gap-2.5'>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${
              item.isActive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-500/10 dark:text-zinc-400'
            }`}
          >
            {item.isActive ? 'Đang hoạt động' : 'Vô hiệu hoá'}
          </span>

          <span className='inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground'>
            {item.baseUnit?.amount}
            {item.baseUnit?.unit}
          </span>
        </div>
      </div>
    </div>
  );
}
