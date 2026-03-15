import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

function ExerciseCardSkeleton() {
  return (
    <div className='flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm'>
      {/* Image */}
      <Skeleton className='aspect-[5/4] w-full' />

      <div className='flex flex-1 flex-col space-y-6 p-8'>
        {/* Title */}
        <Skeleton className='h-7 w-3/4 rounded-lg' />

        {/* Info pills */}
        <div className='flex gap-3'>
          <Skeleton className='h-8 w-24 rounded-xl' />
          <Skeleton className='h-8 w-24 rounded-xl' />
        </div>

        {/* Tags */}
        <div className='mt-auto flex flex-wrap gap-2 border-t border-slate-50 pt-6'>
          <Skeleton className='h-7 w-16 rounded-lg' />
          <Skeleton className='h-7 w-20 rounded-lg' />
          <Skeleton className='h-7 w-14 rounded-lg' />
        </div>

        {/* Button */}
        <Skeleton className='mt-2 h-14 w-full rounded-2xl' />
      </div>
    </div>
  );
}

export default function ExerciseSkeleton() {
  return (
    <div className='mx-auto w-full max-w-7xl space-y-12 px-4 py-12 animate-in fade-in duration-700'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-6 md:flex-row md:items-end'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-[2px] w-8' />
              <Skeleton className='h-3 w-32' />
            </div>

            <Skeleton className='h-10 w-72 rounded-xl md:w-96' />
          </div>

          <Skeleton className='h-4 w-64 md:w-80' />
        </div>

        <Skeleton className='h-12 w-32 rounded-2xl' />
      </div>

      {/* Grid */}
      <div className='grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <ExerciseCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination */}
      <div className='mt-16 flex justify-center rounded-[2.5rem] border border-slate-100 bg-white py-10 shadow-sm'>
        <div className='flex gap-4'>
          <Skeleton className='h-10 w-28 rounded-full' />
          <Skeleton className='h-10 w-28 rounded-full' />
        </div>
      </div>
    </div>
  );
}
