import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function IngredientDetailSkeleton() {
  return (
    <div className='mx-auto w-full max-w-4xl space-y-5'>
      {/* Top bar */}
      <div className='flex items-center justify-between gap-3'>
        <Skeleton className='h-10 w-24 rounded-xl' />
        <Skeleton className='h-5 w-28 rounded-md' />
      </div>

      {/* Card */}
      <div className='rounded-2xl border border-border bg-background/80 p-5 shadow-sm'>
        <div className='flex flex-col gap-5 md:flex-row md:items-start'>
          <Skeleton className='h-44 w-full rounded-2xl md:h-56 md:w-56' />

          <div className='flex-1 space-y-4'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 space-y-2'>
                <Skeleton className='h-8 w-64' />
                <Skeleton className='h-4 w-40' />
              </div>
              <Skeleton className='h-7 w-20 rounded-full' />
            </div>

            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='rounded-xl border border-border p-3'>
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='mt-2 h-6 w-16' />
                </div>
              ))}
            </div>

            <div className='rounded-xl border border-border p-3'>
              <Skeleton className='h-4 w-24' />
              <div className='mt-2 flex flex-wrap gap-2'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className='h-6 w-16 rounded-full' />
                ))}
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='rounded-xl border border-border p-3'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='mt-2 h-5 w-44' />
              </div>
              <div className='rounded-xl border border-border p-3'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='mt-2 h-5 w-44' />
              </div>
            </div>

            <Skeleton className='h-4 w-44' />
          </div>
        </div>
      </div>
    </div>
  );
}
