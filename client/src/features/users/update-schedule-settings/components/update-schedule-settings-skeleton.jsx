import { Skeleton } from '~/components/ui/skeleton';

const UpdateScheduleSettingsSkeleton = () => {
  return (
    <div className='px-4 pb-10 sm:px-6'>
      <div className='mx-auto w-full max-w-5xl'>
        <div className='rounded-[32px] border border-border bg-card p-6 shadow-sm'>
          <div className='mb-6 rounded-[28px] bg-card/70 p-4 shadow-sm backdrop-blur sm:p-5'>
            <div className='space-y-4'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-11 w-11 rounded-xl' />
                    <div className='space-y-2'>
                      <Skeleton className='h-8 w-44' />
                      <Skeleton className='h-3 w-28' />
                    </div>
                  </div>
                </div>
                <Skeleton className='h-10 w-36 rounded-full' />
              </div>

              <Skeleton className='h-4 w-full max-w-2xl' />

              <div className='flex flex-wrap items-center gap-3 rounded-2xl bg-primary/[0.06] px-4 py-3'>
                <Skeleton className='h-7 w-24 rounded-full' />
                <Skeleton className='h-7 w-24 rounded-full' />
                <Skeleton className='h-4 w-40' />
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3'>
              <Skeleton className='h-4 w-72' />
              <Skeleton className='hidden h-4 w-20 sm:block' />
            </div>

            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className='space-y-4 rounded-[24px] border border-border bg-background/80 p-4 sm:p-5'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-4 w-4 rounded-sm' />
                    <Skeleton className='h-10 w-10 rounded-xl' />
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-28' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Skeleton className='h-9 w-9 rounded-xl' />
                    <Skeleton className='h-9 w-9 rounded-xl' />
                    <Skeleton className='h-9 w-9 rounded-xl' />
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                  {[...Array(5)].map((_, itemIndex) => (
                    <div key={itemIndex} className='space-y-2'>
                      <Skeleton className='h-4 w-28' />
                      <Skeleton className='h-10 w-full rounded-xl' />
                    </div>
                  ))}
                </div>

                <div className='space-y-2'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-72' />
                  <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5'>
                    {[...Array(10)].map((_, categoryIndex) => (
                      <Skeleton
                        key={categoryIndex}
                        className='h-9 w-full rounded-xl'
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Skeleton className='h-12 w-full rounded-[20px]' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateScheduleSettingsSkeleton;
