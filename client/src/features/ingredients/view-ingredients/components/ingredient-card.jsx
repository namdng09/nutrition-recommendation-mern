import React from 'react';

export default function IngredientCard({ item }) {
  return (
    <div className='rounded-2xl border border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 p-4 shadow-sm'>
      <div className='flex gap-4'>
        <div className='h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted'>
          <img
            src={item.image || '/placeholder.png'}
            alt={item.name}
            className='h-full w-full object-cover'
            loading='lazy'
          />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0'>
              <h3 className='truncate text-base font-semibold text-foreground'>
                {item.name}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {item.category} • {item.unit}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                item.isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {item.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
            </span>
          </div>

          <div className='mt-3 grid grid-cols-2 gap-2 text-sm'>
            <div className='rounded-xl border border-border p-2'>
              <div className='text-muted-foreground'>Calo / 100g</div>
              <div className='font-semibold text-foreground'>
                {item.caloriesPer100g}
              </div>
            </div>

            <div className='rounded-xl border border-border p-2'>
              <div className='text-muted-foreground'>Chất đạm</div>
              <div className='font-semibold text-foreground'>
                {item.protein}g
              </div>
            </div>

            <div className='rounded-xl border border-border p-2'>
              <div className='text-muted-foreground'>Tinh bột</div>
              <div className='font-semibold text-foreground'>{item.carbs}g</div>
            </div>

            <div className='rounded-xl border border-border p-2'>
              <div className='text-muted-foreground'>Chất béo</div>
              <div className='font-semibold text-foreground'>{item.fat}g</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
