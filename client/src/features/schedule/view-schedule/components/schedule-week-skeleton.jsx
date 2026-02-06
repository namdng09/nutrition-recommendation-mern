import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function ScheduleWeekSkeleton() {
  return (
    <div
      className='
        relative min-w-[320px] flex-1
        rounded-[40px] p-8
        bg-card
        border border-border
        shadow-sm
      '
    >
      {/* Header */}
      <div className='mb-6 text-center space-y-2'>
        <Skeleton className='h-3 w-24 mx-auto' />
        <Skeleton className='h-7 w-16 mx-auto' />
      </div>

      {/* Content */}
      <div className='flex-1 flex flex-col justify-between'>
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center gap-4 rounded-2xl p-3.5 border border-border bg-muted/40'
            >
              {/* icon */}
              <Skeleton className='h-10 w-10 rounded-xl shrink-0' />

              {/* text */}
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-3 w-20' />
                <Skeleton className='h-4 w-full' />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Skeleton className='mt-5 h-12 w-full rounded-2xl' />
      </div>
    </div>
  );
}
