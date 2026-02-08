import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function ScheduleTodaySkeleton() {
  return (
    <div className='mx-auto w-full max-w-md space-y-5'>
      {/* Card */}
      <div className='rounded-[32px] border border-border bg-background/80 p-6 shadow-sm'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between border-b border-border pb-5 px-1'>
          <div className='space-y-2'>
            <Skeleton className='h-3 w-28 rounded-md' />
            <Skeleton className='h-6 w-40 rounded-lg' />
          </div>

          <Skeleton className='h-11 w-11 rounded-2xl' />
        </div>

        {/* Meals */}
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='flex gap-4 rounded-[20px] p-4 border border-border bg-background'
            >
              {/* Icon */}
              <Skeleton className='h-11 w-11 rounded-xl shrink-0' />

              {/* Content */}
              <div className='flex-1 space-y-3'>
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-10 rounded-full' />
                </div>

                {/* Dish rows */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-3 rounded-xl border border-border p-3'>
                    <Skeleton className='h-12 w-12 rounded-xl shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-3 w-40' />
                      <Skeleton className='h-3 w-28' />
                    </div>
                  </div>

                  <div className='flex items-center gap-3 rounded-xl border border-border p-3'>
                    <Skeleton className='h-12 w-12 rounded-xl shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-3 w-36' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 dots */}
              <Skeleton className='h-8 w-8 rounded-full shrink-0' />
            </div>
          ))}
        </div>

        {/* Action button */}
        <Skeleton className='mt-6 h-12 w-full rounded-2xl' />
      </div>
    </div>
  );
}
