import React from 'react';

export default function NutritionDetailSection({
  title,
  items,
  themeClass,
  icon
}) {
  if (!items?.length) return null;

  return (
    <div>
      <div className='mb-4 flex items-center gap-2'>
        <span className={`${themeClass} p-1.5 rounded-lg border`}>{icon}</span>
        <h3 className='text-xs font-black uppercase tracking-widest opacity-70'>
          {title}
        </h3>
        <div className='h-px flex-1 bg-border/60' />
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {items.map(item => (
          <NutritionItemCard
            key={item.label}
            item={item}
            themeClass={themeClass}
          />
        ))}
      </div>
    </div>
  );
}

function NutritionItemCard({ item, themeClass }) {
  return (
    <div
      className={`${themeClass} flex flex-col rounded-2xl border p-3 shadow-sm transition-all hover:shadow-md`}
    >
      <span className='mb-1 text-[10px] font-bold uppercase opacity-60 truncate'>
        {item.label}
      </span>
      <div className='flex items-baseline gap-0.5'>
        <span className='text-sm font-black'>{item.value}</span>
        <span className='text-[10px] font-medium opacity-80'>{item.unit}</span>
      </div>
    </div>
  );
}
