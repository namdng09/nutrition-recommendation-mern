import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function CollectionSkeleton() {
  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-4 py-10 animate-in fade-in duration-700'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8'>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-10 w-10 rounded-xl' />
            <Skeleton className='h-8 w-64' />
          </div>
          <Skeleton className='h-4 w-80' />
        </div>

        <Skeleton className='h-7 w-28 rounded-full' />
      </div>

      {/* Grid */}
      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='flex flex-col rounded-[2rem] border border-border bg-background p-6 space-y-4'
          >
            {/* Title + lock */}
            <div className='flex items-start justify-between gap-3'>
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-5 w-16 rounded-full' />
            </div>

            {/* Stats */}
            <div className='flex gap-2'>
              <Skeleton className='h-6 w-20 rounded-full' />
              <Skeleton className='h-6 w-20 rounded-full' />
            </div>

            {/* Featured dish */}
            <div className='flex items-center gap-4 rounded-2xl border border-border/60 p-3'>
              <Skeleton className='h-14 w-14 rounded-xl' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-40' />
              </div>
            </div>

            {/* Tags */}
            <div className='flex gap-2'>
              <Skeleton className='h-4 w-12 rounded-md' />
              <Skeleton className='h-4 w-14 rounded-md' />
              <Skeleton className='h-4 w-10 rounded-md' />
            </div>

            {/* Footer */}
            <div className='mt-auto flex items-center justify-between border-t border-border/50 pt-3'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-8 w-8 rounded-full' />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className='flex justify-center gap-3 pt-6'>
        <Skeleton className='h-9 w-24 rounded-full' />
        <Skeleton className='h-9 w-24 rounded-full' />
      </div>
    </div>
  );
}
