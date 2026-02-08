import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function DishNutritionDetailSkeleton() {
  return (
    <div className='mx-auto max-w-4xl space-y-10 p-8'>
      <Skeleton className='h-10 w-64' />

      <div className='grid grid-cols-2 gap-6 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-border p-4 text-center'
          >
            <Skeleton className='mx-auto h-3 w-20' />
            <Skeleton className='mx-auto mt-2 h-7 w-16' />
          </div>
        ))}
      </div>

      {Array.from({ length: 4 }).map((_, sectionIdx) => (
        <div key={sectionIdx} className='space-y-4'>
          <Skeleton className='h-7 w-40' />

          <div className='grid gap-3 sm:grid-cols-2'>
            {Array.from({ length: 4 }).map((_, itemIdx) => (
              <div
                key={itemIdx}
                className='flex justify-between rounded-lg border border-border p-3'
              >
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-16' />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
