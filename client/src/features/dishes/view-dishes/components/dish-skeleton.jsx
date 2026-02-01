import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function DishSkeleton() {
  return (
    <div className='mx-auto w-full max-w-7xl space-y-10 px-4 py-8 animate-in fade-in duration-500'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8'>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-12 w-12 rounded-2xl' />
            <Skeleton className='h-9 w-72' />
          </div>
          <Skeleton className='h-4 w-96' />
        </div>

        <Skeleton className='hidden md:block h-9 w-48 rounded-xl' />
      </div>

      {/* Grid */}
      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='flex flex-col overflow-hidden rounded-[2rem] border border-border bg-background'
          >
            {/* Image */}
            <Skeleton className='h-60 w-full' />

            <div className='flex flex-1 flex-col p-6 space-y-4'>
              {/* Title */}
              <Skeleton className='h-6 w-3/4' />

              {/* Stats */}
              <div className='flex flex-wrap gap-2'>
                <Skeleton className='h-6 w-24 rounded-full' />
                <Skeleton className='h-6 w-24 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
              </div>

              {/* Footer */}
              <div className='mt-auto flex items-center justify-between border-t border-border/50 pt-4'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-7 w-7 rounded-full' />
                  <Skeleton className='h-4 w-20' />
                </div>

                <Skeleton className='h-4 w-16' />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className='pt-10 flex justify-center gap-4'>
        <Skeleton className='h-9 w-24 rounded-full' />
        <Skeleton className='h-9 w-24 rounded-full' />
      </div>
    </div>
  );
}
