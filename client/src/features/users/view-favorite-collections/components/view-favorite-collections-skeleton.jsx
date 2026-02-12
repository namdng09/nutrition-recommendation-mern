import React from 'react';

export default function ViewFavoriteCollectionsSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='rounded-[2rem] border border-border bg-background overflow-hidden'
        >
          {/* Image skeleton */}
          <div className='h-50 w-full bg-muted animate-pulse' />

          <div className='p-6 space-y-4'>
            {/* Title skeleton */}
            <div className='h-6 w-3/4 rounded-lg bg-muted animate-pulse' />

            {/* Stats badges skeleton */}
            <div className='flex flex-wrap gap-2'>
              {Array.from({ length: 2 }).map((__, j) => (
                <div
                  key={j}
                  className='h-6 w-20 rounded-full bg-muted animate-pulse'
                />
              ))}
            </div>

            {/* Featured dish skeleton */}
            <div className='flex items-center gap-4 rounded-xl border border-border/60 bg-secondary/20 p-3'>
              <div className='h-12 w-12 rounded-lg bg-muted animate-pulse' />
              <div className='flex-1 space-y-2'>
                <div className='h-4 w-32 rounded-lg bg-muted animate-pulse' />
                <div className='h-3 w-24 rounded-lg bg-muted animate-pulse' />
              </div>
            </div>

            {/* Tags skeleton */}
            <div className='flex flex-wrap gap-1.5'>
              {Array.from({ length: 3 }).map((__, j) => (
                <div
                  key={j}
                  className='h-4 w-16 rounded-lg bg-muted animate-pulse'
                />
              ))}
            </div>

            {/* Footer skeleton */}
            <div className='border-t border-border/50 pt-3 flex items-center justify-between'>
              <div className='h-3 w-24 rounded-lg bg-muted animate-pulse' />
              <div className='h-8 w-8 rounded-full bg-muted animate-pulse' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
