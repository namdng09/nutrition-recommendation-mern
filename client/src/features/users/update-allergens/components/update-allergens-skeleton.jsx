import { OctagonAlert } from 'lucide-react';

export const UpdateAllergensSkeleton = () => {
  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl space-y-6'>
        {/* Header Skeleton */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 bg-muted animate-pulse rounded-lg' />
            <div className='h-8 w-40 bg-muted animate-pulse rounded' />
          </div>
          <div className='h-4 w-96 bg-muted animate-pulse rounded' />
        </div>

        {/* Card Skeleton */}
        <div className='rounded-lg border bg-card shadow-sm'>
          <div className='p-6'>
            <div className='grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8'>
              {/* Left Column Skeleton */}
              <div className='hidden lg:flex flex-col items-center gap-8 pt-4'>
                <div className='h-32 w-32 bg-muted animate-pulse rounded-full' />
                <div className='h-32 w-32 bg-muted animate-pulse rounded-lg' />
              </div>

              {/* Right Column Skeleton */}
              <div className='space-y-6'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='space-y-3'>
                    <div className='h-4 w-48 bg-muted animate-pulse rounded' />
                    <div className='flex flex-wrap gap-2'>
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className='h-10 w-24 bg-muted animate-pulse rounded-lg'
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className='border-t bg-muted/30 px-6 py-4 flex justify-end'>
            <div className='h-10 w-32 bg-muted animate-pulse rounded' />
          </div>
        </div>
      </div>
    </div>
  );
};
