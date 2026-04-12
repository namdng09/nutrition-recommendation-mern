import React from 'react';

import { Skeleton } from '~/components/ui/skeleton';

export default function EditPrivateDishSkeleton() {
  return (
    <div className='light min-h-screen bg-background px-4 py-6 text-foreground md:px-6 md:py-8'>
      <div className='mx-auto w-full max-w-8xl'>
        <div className='xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8'>
          <div className='animate-in space-y-8 fade-in duration-500'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-2.5 self-start rounded-2xl border border-border bg-background px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)]'>
                <Skeleton className='h-9 w-9 rounded-xl' />
                <Skeleton className='h-5 w-20' />
              </div>

              <Skeleton className='h-12 w-40 rounded-2xl' />
            </div>

            <div className='space-y-3 border-b border-border pb-6'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-12 w-12 rounded-2xl' />
                <Skeleton className='h-9 w-80' />
              </div>

              <Skeleton className='h-4 w-[28rem]' />

              <div className='flex flex-wrap gap-3 pt-2'>
                <Skeleton className='h-10 w-32 rounded-2xl' />
                <Skeleton className='h-10 w-32 rounded-2xl' />
                <Skeleton className='h-10 w-32 rounded-2xl' />
              </div>
            </div>

            <div className='space-y-6 rounded-[2rem] border border-border bg-background p-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-6 w-40' />
                  <Skeleton className='h-10 w-28 rounded-xl' />
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]'>
                  <Skeleton className='h-52 w-full rounded-[1.5rem]' />

                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Skeleton className='h-5 w-28' />
                      <Skeleton className='h-12 w-full rounded-2xl' />
                    </div>

                    <div className='space-y-2'>
                      <Skeleton className='h-5 w-32' />
                      <Skeleton className='h-28 w-full rounded-2xl' />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <Skeleton className='h-5 w-28' />
                        <Skeleton className='h-12 w-full rounded-2xl' />
                      </div>

                      <div className='space-y-2'>
                        <Skeleton className='h-5 w-36' />
                        <Skeleton className='h-12 w-full rounded-2xl' />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Skeleton className='h-5 w-36' />
                      <Skeleton className='h-12 w-full rounded-2xl' />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-6 rounded-[2rem] border border-border bg-background p-6'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-6 w-48' />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Skeleton className='h-24 w-full rounded-2xl' />
                <Skeleton className='h-24 w-full rounded-2xl' />
                <Skeleton className='h-24 w-full rounded-2xl' />
                <Skeleton className='h-24 w-full rounded-2xl' />
              </div>
            </div>

            <div className='space-y-6 rounded-[2rem] border border-border bg-background p-6'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-6 w-44' />
                <Skeleton className='h-10 w-40 rounded-xl' />
              </div>

              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className='rounded-[30px] border border-border/70 bg-background p-5'
                >
                  <div className='space-y-5'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex min-w-0 items-start gap-4'>
                        <Skeleton className='h-24 w-24 rounded-[24px]' />

                        <div className='min-w-0 flex-1 space-y-3'>
                          <div className='flex items-center gap-2'>
                            <Skeleton className='h-6 w-44' />
                            <Skeleton className='h-7 w-16 rounded-full' />
                          </div>

                          <div className='flex flex-wrap gap-2'>
                            <Skeleton className='h-7 w-20 rounded-full' />
                            <Skeleton className='h-7 w-24 rounded-full' />
                          </div>
                        </div>
                      </div>

                      <Skeleton className='h-11 w-11 rounded-2xl' />
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                      <Skeleton className='h-20 w-full rounded-2xl' />
                      <Skeleton className='h-20 w-full rounded-2xl' />
                      <Skeleton className='h-20 w-full rounded-2xl' />
                      <Skeleton className='h-20 w-full rounded-2xl' />
                    </div>

                    <div className='rounded-[24px] border border-border/70 bg-background/80 p-4'>
                      <div className='space-y-3'>
                        <Skeleton className='h-5 w-28' />
                        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                          <Skeleton className='h-12 flex-1 rounded-2xl' />
                          <Skeleton className='h-12 w-24 rounded-2xl' />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-6 rounded-[2rem] border border-border bg-background p-6'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-6 w-40' />
                <Skeleton className='h-10 w-32 rounded-xl' />
              </div>

              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className='rounded-2xl border border-border p-4 space-y-4'
                >
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-10 w-10 rounded-xl' />
                    <Skeleton className='h-5 w-32' />
                  </div>
                  <Skeleton className='h-24 w-full rounded-2xl' />
                </div>
              ))}
            </div>

            <div className='space-y-6 rounded-[2rem] border border-border bg-background p-6'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-6 w-36' />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-12 w-full rounded-2xl' />
                </div>

                <div className='space-y-2'>
                  <Skeleton className='h-5 w-28' />
                  <Skeleton className='h-12 w-full rounded-2xl' />
                </div>

                <div className='space-y-2'>
                  <Skeleton className='h-5 w-24' />
                  <Skeleton className='h-12 w-full rounded-2xl' />
                </div>
              </div>

              <div className='space-y-3'>
                <Skeleton className='h-5 w-20' />
                <div className='flex flex-wrap gap-2'>
                  <Skeleton className='h-10 w-24 rounded-full' />
                  <Skeleton className='h-10 w-20 rounded-full' />
                  <Skeleton className='h-10 w-28 rounded-full' />
                </div>
              </div>
            </div>
          </div>

          <div className='hidden xl:block xl:pt-[92px]'>
            <div className='sticky top-6'>
              <div className='rounded-[2rem] border border-border bg-background p-6 space-y-6'>
                <Skeleton className='h-6 w-40' />
                <Skeleton className='mx-auto h-64 w-64 rounded-full' />
                <div className='space-y-3'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-5/6' />
                  <Skeleton className='h-4 w-4/6' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
