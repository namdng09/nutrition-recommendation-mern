import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

function StatCardSkeleton() {
  return (
    <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
      <Skeleton className='mb-3 h-11 w-11 rounded-2xl' />
      <Skeleton className='h-3 w-28 rounded-md' />
      <Skeleton className='mt-3 h-8 w-24 rounded-lg' />
      <Skeleton className='mt-3 h-3 w-40 rounded-md' />
    </div>
  );
}

function MacroCardSkeleton() {
  return (
    <div className='rounded-[24px] border border-border bg-background/70 p-4'>
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-3 w-16 rounded-md' />
        </div>

        <div className='space-y-2 text-right'>
          <Skeleton className='ml-auto h-5 w-14 rounded-md' />
          <Skeleton className='ml-auto h-3 w-8 rounded-md' />
        </div>
      </div>

      <Skeleton className='h-2.5 w-full rounded-full' />

      <div className='mt-3 flex items-center justify-between'>
        <Skeleton className='h-3 w-10 rounded-md' />
        <Skeleton className='h-3 w-24 rounded-md' />
      </div>
    </div>
  );
}

function MiniHighlightSkeleton() {
  return (
    <div className='rounded-2xl border border-border/60 bg-background/70 p-4'>
      <Skeleton className='h-3 w-16 rounded-md' />
      <Skeleton className='mt-3 h-6 w-24 rounded-md' />
    </div>
  );
}

function NutritionTableSkeleton() {
  return (
    <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
      <Skeleton className='mb-4 h-7 w-28 rounded-full' />

      <div className='space-y-2'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-background/70 px-4 py-3'
          >
            <Skeleton className='h-4 w-28 rounded-md' />
            <div className='space-y-2 text-right'>
              <Skeleton className='ml-auto h-4 w-14 rounded-md' />
              <Skeleton className='ml-auto h-3 w-8 rounded-md' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MealEnergyCardSkeleton() {
  return (
    <div className='rounded-[24px] border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-3 w-16 rounded-md' />
        </div>

        <Skeleton className='h-7 w-20 rounded-full' />
      </div>

      <div className='mt-4 space-y-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className='flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/70 px-3 py-2.5'
          >
            <Skeleton className='h-4 w-32 rounded-md' />
            <Skeleton className='h-4 w-12 rounded-md' />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScheduleNutritionSkeleton() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='mb-3'>
              <Skeleton className='h-10 w-36 rounded-full' />
            </div>

            <Skeleton className='h-9 w-64 rounded-lg' />
            <Skeleton className='mt-2 h-4 w-40 rounded-md' />
          </div>

          <Skeleton className='h-20 w-40 rounded-[24px]' />
        </div>

        {/* Top stats */}
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Macro + highlight */}
        <div className='mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
          <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
            <div className='mb-5 flex items-center gap-3'>
              <Skeleton className='h-10 w-10 rounded-2xl' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-36 rounded-md' />
                <Skeleton className='h-3 w-52 rounded-md' />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <MacroCardSkeleton key={i} />
              ))}
            </div>

            <div className='mt-5 rounded-[24px] border border-border/60 bg-background/70 p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <Skeleton className='h-4 w-40 rounded-md' />
                <Skeleton className='h-4 w-12 rounded-md' />
              </div>

              <Skeleton className='h-3 w-full rounded-full' />
              <Skeleton className='mt-3 h-3 w-72 rounded-md' />
            </div>
          </div>

          <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
            <div className='mb-5 flex items-center gap-3'>
              <Skeleton className='h-10 w-10 rounded-2xl' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-28 rounded-md' />
                <Skeleton className='h-3 w-44 rounded-md' />
              </div>
            </div>

            <div className='grid gap-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                <MiniHighlightSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className='mt-6 grid gap-6 xl:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <NutritionTableSkeleton key={i} />
          ))}
        </div>

        {/* Meal cards */}
        <div className='mt-6 rounded-[28px] border border-border bg-card p-5 shadow-sm'>
          <Skeleton className='mb-5 h-6 w-44 rounded-md' />

          <div className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <MealEnergyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
