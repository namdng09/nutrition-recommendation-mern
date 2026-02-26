import React from 'react';

export function ViewBlockDishesSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col overflow-hidden rounded-[2rem] border border-destructive/20 bg-background'
        >
          {/* Image Skeleton */}
          <div className='relative h-60 w-full bg-muted animate-pulse'>
            {/* Ban Badge Skeleton */}
            <div className='absolute left-4 top-4 h-8 w-8 rounded-full bg-muted-foreground/20 animate-pulse' />
            {/* Unblock Button Skeleton */}
            <div className='absolute right-4 top-4 h-9 w-9 rounded-full bg-muted-foreground/20 animate-pulse' />
          </div>

          {/* Content Skeleton */}
          <div className='flex flex-1 flex-col p-6 space-y-4'>
            {/* Title */}
            <div className='h-6 w-3/4 rounded-lg bg-muted animate-pulse' />

            {/* Badges */}
            <div className='flex gap-2'>
              <div className='h-6 w-20 rounded-full bg-muted animate-pulse' />
              <div className='h-6 w-20 rounded-full bg-muted animate-pulse' />
              <div className='h-6 w-20 rounded-full bg-muted animate-pulse' />
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <div className='h-4 w-full rounded-lg bg-muted animate-pulse' />
              <div className='h-4 w-5/6 rounded-lg bg-muted animate-pulse' />
            </div>

            {/* Footer */}
            <div className='flex items-center justify-between border-t border-border/50 pt-4 mt-auto'>
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
