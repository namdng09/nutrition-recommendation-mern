import React from 'react';

export default function ViewFavoriteIngredientsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='rounded-2xl border border-border bg-background/80 p-5 shadow-sm'
        >
          <div className='flex gap-4'>
            <div className='h-20 w-20 rounded-2xl bg-muted animate-pulse' />

            <div className='flex-1 space-y-3'>
              <div className='flex items-start justify-between gap-2'>
                <div className='space-y-2 flex-1'>
                  <div className='h-5 w-32 rounded-lg bg-muted animate-pulse' />
                  <div className='h-4 w-24 rounded-lg bg-muted animate-pulse' />
                </div>
                <div className='h-8 w-8 rounded-full bg-muted animate-pulse' />
              </div>

              <div className='grid grid-cols-2 gap-2 mt-4'>
                {Array.from({ length: 4 }).map((__, j) => (
                  <div
                    key={j}
                    className='rounded-xl border border-border p-3 space-y-2'
                  >
                    <div className='h-3 w-20 rounded-lg bg-muted animate-pulse' />
                    <div className='h-4 w-16 rounded-lg bg-muted animate-pulse' />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
