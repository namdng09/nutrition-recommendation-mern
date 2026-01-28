import React from 'react';
import { FaAppleAlt, FaBox, FaLeaf } from 'react-icons/fa';

export default function IngredientCard({ item }) {
  const nutrients = item?.nutrition?.nutrients || {};

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
            </div>

            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                item.isActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {item.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
            </span>
          </div>

          <div className='mt-3 grid grid-cols-2 gap-2 text-sm'>
            <div className='rounded-xl border border-border p-2'>
              <div className='text-muted-foreground'>
                Calo / {item.baseUnit?.amount}
                {item.baseUnit?.unit}
              </div>
              <div className='font-semibold text-foreground'>
                {nutrients.calories?.value ?? '--'} {nutrients.calories?.unit}
              </div>
            </div>

            <div className='rounded-xl border border-border p-2'>
              <div className='text-muted-foreground'>Đạm</div>
              <div className='font-semibold text-foreground'>
                {nutrients.protein?.value ?? '--'}g
              </div>
            </div>

            <div className='rounded-xl border border-border p-2'>
              <div className='text-muted-foreground'>Tinh bột</div>
              <div className='font-semibold text-foreground'>
                {nutrients.carbs?.value ?? '--'}g
              </div>
            </div>

            <div className='rounded-xl border border-border p-2'>
              <div className='text-muted-foreground'>Chất béo</div>
              <div className='font-semibold text-foreground'>
                {nutrients.fat?.value ?? '--'}g
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
