import { Skeleton } from '~/components/ui/skeleton';

export default function NutritionistsListSkeleton() {
  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <Skeleton className='h-4 w-48' />
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className='flex flex-col overflow-hidden rounded-lg border border-border p-4 space-y-4'
          >
            <div className='flex items-center gap-4'>
              <Skeleton className='h-14 w-14 rounded-full shrink-0' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-6 w-32 rounded-full' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
