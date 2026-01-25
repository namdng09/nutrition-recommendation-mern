import React from 'react';

export default function IngredientsSkeleton() {
  return (
    <div className='mx-auto w-full max-w-5xl space-y-4'>
      {/* Toolbar skeleton */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <div className='h-8 w-40 rounded-lg bg-muted' />
          <div className='h-4 w-56 rounded-lg bg-muted' />
        </div>

        <div className='w-full sm:w-72'>
          <div className='h-10 w-full rounded-xl bg-muted' />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='rounded-2xl border border-border bg-background/80 p-4 shadow-sm'
          >
            <div className='flex gap-4'>
              <div className='h-16 w-16 rounded-xl bg-muted' />

              <div className='flex-1 space-y-3'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='space-y-2'>
                    <div className='h-5 w-40 rounded-lg bg-muted' />
                    <div className='h-4 w-28 rounded-lg bg-muted' />
                  </div>
                  <div className='h-6 w-16 rounded-full bg-muted' />
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <div
                      key={j}
                      className='rounded-xl border border-border p-2'
                    >
                      <div className='h-3 w-24 rounded-lg bg-muted' />
                      <div className='mt-2 h-4 w-16 rounded-lg bg-muted' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className='flex items-center justify-between'>
        <div className='h-10 w-20 rounded-xl bg-muted' />
        <div className='h-4 w-40 rounded-lg bg-muted' />
        <div className='h-10 w-20 rounded-xl bg-muted' />
      </div>
    </div>
  );
}
