import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function CollectionDetailSkeleton() {
  return (
    <div className='mx-auto w-full max-w-6xl space-y-12 pb-20 pt-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* Back link */}
      <Skeleton className='h-4 w-48' />

      {/* Collection header card */}
      <div className='rounded-[2.5rem] border border-border bg-background p-8 md:p-12 space-y-8'>
        <div className='flex flex-wrap items-start justify-between gap-8'>
          <div className='max-w-3xl space-y-5'>
            <div className='space-y-3'>
              <Skeleton className='h-10 w-96' />
              <Skeleton className='h-5 w-80' />
            </div>

            <div className='flex gap-3'>
              <Skeleton className='h-7 w-28 rounded-full' />
              <Skeleton className='h-7 w-28 rounded-full' />
            </div>
          </div>

          <Skeleton className='h-9 w-32 rounded-full' />
        </div>

        {/* Tags */}
        <div className='flex flex-wrap gap-2 pt-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-7 w-20 rounded-lg' />
          ))}
        </div>
      </div>

      {/* Dish list header */}
      <div className='space-y-8'>
        <div className='flex items-center justify-between border-b border-border pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-10 w-10 rounded-2xl' />
            <Skeleton className='h-7 w-48' />
          </div>
          <Skeleton className='h-7 w-20 rounded-full' />
        </div>

        {/* Dish grid */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center gap-5 rounded-[1.5rem] border border-border bg-background p-4'
            >
              <Skeleton className='h-24 w-24 rounded-2xl' />

              <div className='flex-1 space-y-3'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-5 w-24 rounded-md' />
              </div>

              <Skeleton className='h-10 w-10 rounded-full' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
