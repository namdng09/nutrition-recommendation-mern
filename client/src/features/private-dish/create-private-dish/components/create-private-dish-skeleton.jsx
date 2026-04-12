import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function CreatePrivateDishSkeleton() {
  return (
    <div className='mx-auto w-full max-w-5xl animate-in space-y-8 fade-in duration-500'>
      <div className='space-y-3 border-b border-border pb-6'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-12 w-12 rounded-2xl' />
          <Skeleton className='h-9 w-80' />
        </div>
        <Skeleton className='h-4 w-[28rem]' />
      </div>

      <div className='space-y-6 rounded-[2rem] border border-border bg-background p-6'>
        <div className='space-y-2'>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='h-12 w-full rounded-xl' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-28 w-full rounded-xl' />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-28' />
            <Skeleton className='h-12 w-full rounded-xl' />
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-5 w-36' />
            <Skeleton className='h-12 w-full rounded-xl' />
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-10 w-36 rounded-xl' />
          </div>

          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className='rounded-2xl border border-border p-4 space-y-4'
            >
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Skeleton className='h-12 w-full rounded-xl md:col-span-2' />
                <Skeleton className='h-12 w-full rounded-xl' />
              </div>
              <Skeleton className='h-12 w-full rounded-xl' />
            </div>
          ))}
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-10 w-28 rounded-xl' />
          </div>

          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-24 w-full rounded-2xl' />
          ))}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-12 w-full rounded-xl' />
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-5 w-28' />
            <Skeleton className='h-12 w-full rounded-xl' />
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-5 w-24' />
            <Skeleton className='h-12 w-full rounded-xl' />
          </div>
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-5 w-20' />
          <Skeleton className='h-12 w-full rounded-xl' />
        </div>

        <div className='flex justify-end pt-2'>
          <Skeleton className='h-12 w-44 rounded-xl' />
        </div>
      </div>
    </div>
  );
}
