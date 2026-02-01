import { Skeleton } from '~/components/ui/skeleton';

export function UpdateNutritionTargetSkeleton() {
  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Skeleton className='h-7 w-7 rounded' />
        <Skeleton className='h-8 w-40' />
      </div>

      <div className='space-y-6'>
        {/* Physical Metrics Card */}
        <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
          <div className='mb-6 space-y-2'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-56' />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full rounded-xl' />
              </div>
            ))}
          </div>

          <div className='space-y-4 pt-6'>
            <Skeleton className='h-5 w-16' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full rounded-xl' />
            </div>
          </div>
        </div>

        {/* Macro Configuration Card */}
        <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
          <div className='mb-6 space-y-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-72' />
          </div>

          <div className='mb-6'>
            <Skeleton className='h-4 w-32 mb-2' />
            <Skeleton className='h-10 w-full rounded-xl' />
          </div>

          <div className='space-y-6'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-5 w-20' />
                  <Skeleton className='h-8 w-48' />
                </div>
                <Skeleton className='h-2 w-full rounded-full' />
              </div>
            ))}
            <Skeleton className='h-10 w-full rounded-xl' />
          </div>
        </div>
      </div>
    </div>
  );
}
