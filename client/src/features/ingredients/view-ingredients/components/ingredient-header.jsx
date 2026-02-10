import React from 'react';

export default function IngredientHeader({ item }) {
  return (
    <div className='flex items-center gap-4 mb-5'>
      <div className='relative h-20 w-20 overflow-hidden rounded-2xl bg-secondary/30'>
        <img
          src={item.image || '/placeholder.png'}
          alt={item.name}
          className='h-full w-full object-cover'
        />
      </div>

      <div className='flex-1 space-y-1.5'>
        <h3 className='text-lg font-bold'>{item.name}</h3>

        <div className='flex items-center gap-2'>
          <span
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              item.isActive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-zinc-100 text-zinc-400'
            }`}
          >
            {item.isActive ? 'Đang hoạt động' : 'Vô hiệu hoá'}
          </span>

          <span className='text-xs text-muted-foreground'>
            {item.baseUnit?.amount}
            {item.baseUnit?.unit}
          </span>
        </div>
      </div>
    </div>
  );
}
