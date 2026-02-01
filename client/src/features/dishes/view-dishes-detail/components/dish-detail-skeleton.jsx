import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function DishDetailSkeleton() {
  return (
    <div className='mx-auto w-full max-w-7xl space-y-20 px-4 py-14 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* Back button */}
      <div className='flex items-center gap-3'>
        <Skeleton className='h-9 w-9 rounded-full' />
        <Skeleton className='h-4 w-24' />
      </div>

      {/* Hero section */}
      <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
        {/* Image */}
        <div className='mx-auto w-[72%]'>
          <Skeleton className='aspect-[3/4] w-full rounded-[2rem]' />
        </div>

        {/* Info */}
        <div className='flex flex-col gap-12'>
          <div className='space-y-6'>
            {/* Tags */}
            <div className='flex flex-wrap gap-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-5 w-24' />
              ))}
            </div>

            {/* Title + description */}
            <Skeleton className='h-12 w-5/6' />
            <Skeleton className='h-6 w-full max-w-xl' />
            <Skeleton className='h-6 w-4/5 max-w-xl' />
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='rounded-2xl border border-border p-6 space-y-3'
              >
                <Skeleton className='h-6 w-6 rounded-full' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-6 w-24' />
              </div>
            ))}
          </div>

          {/* Author */}
          <div className='flex items-center gap-4 border-t border-border pt-6'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-4 w-32' />
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className='space-y-8'>
        <div className='flex items-center justify-between border-b border-border pb-4'>
          <Skeleton className='h-7 w-40' />
          <Skeleton className='h-6 w-10 rounded-md' />
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center gap-4 rounded-2xl border border-border bg-background p-4'
            >
              <Skeleton className='h-14 w-14 rounded-xl' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-24' />
              </div>
              <Skeleton className='h-4 w-12' />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className='space-y-10'>
        <Skeleton className='h-7 w-48' />

        <div className='space-y-12'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex gap-8'>
              <Skeleton className='h-9 w-9 rounded-full' />
              <div className='flex-1 rounded-3xl border border-border p-6 space-y-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
