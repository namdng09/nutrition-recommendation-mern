import React from 'react';

export default function ViewFavoriteDishesSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='rounded-[2rem] border border-border bg-background overflow-hidden'
        >
          {/* Image skeleton */}
          <div className='h-60 w-full bg-muted animate-pulse' />

          <div className='p-6 space-y-4'>
            {/* Title skeleton */}
            <div className='h-6 w-3/4 rounded-lg bg-muted animate-pulse' />

            {/* Stats badges skeleton */}
            <div className='flex flex-wrap gap-2'>
              {Array.from({ length: 3 }).map((__, j) => (
                <div
                  key={j}
                  className='h-8 w-20 rounded-full bg-muted animate-pulse'
                />
              ))}
            </div>

            {/* Description skeleton */}
            <div className='space-y-2'>
              <div className='h-4 w-full rounded-lg bg-muted animate-pulse' />
              <div className='h-4 w-2/3 rounded-lg bg-muted animate-pulse' />
            </div>

            {/* Footer skeleton */}
            <div className='border-t border-border/50 pt-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='h-7 w-7 rounded-full bg-muted animate-pulse' />
                <div className='h-4 w-20 rounded-lg bg-muted animate-pulse' />
              </div>
              <div className='h-4 w-16 rounded-lg bg-muted animate-pulse' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
