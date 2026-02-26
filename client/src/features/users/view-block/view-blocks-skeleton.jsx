import React from 'react';

export function ViewBlocksSkeleton() {
  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Header Skeleton */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-lg bg-muted animate-pulse' />
            <div className='h-8 w-40 rounded-lg bg-muted animate-pulse' />
          </div>
          <div className='h-4 w-72 rounded-lg bg-muted animate-pulse' />
        </div>

        {/* Tabs Skeleton */}
        <div className='space-y-4'>
          <div className='grid w-full max-w-md grid-cols-2 gap-2'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className='h-10 rounded-md bg-muted animate-pulse' />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='h-48 rounded-2xl border border-destructive/20 bg-muted animate-pulse'
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
