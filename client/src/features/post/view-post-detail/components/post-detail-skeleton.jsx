import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function PostDetailSkeleton() {
  return (
    <div className='mx-auto max-w-4xl px-6 py-16 space-y-8 animate-in fade-in duration-500'>
      {/* Category */}
      <Skeleton className='h-6 w-32 rounded-full' />

      {/* Title */}
      <div className='space-y-3'>
        <Skeleton className='h-9 w-full' />
        <Skeleton className='h-9 w-4/5' />
      </div>

      {/* Meta */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5 rounded-full' />
          <Skeleton className='h-4 w-24' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5 rounded-full' />
          <Skeleton className='h-4 w-28' />
        </div>
        <Skeleton className='h-4 w-20' />
      </div>

      {/* Image */}
      <Skeleton className='h-[320px] w-full rounded-2xl' />

      {/* Content */}
      <div className='space-y-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-4 w-full' />
        ))}
        <Skeleton className='h-4 w-4/5' />
        <Skeleton className='h-4 w-3/5' />
      </div>

      {/* Tags */}
      <div className='flex flex-wrap gap-2 pt-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-6 w-16 rounded-full' />
        ))}
      </div>
    </div>
  );
}
