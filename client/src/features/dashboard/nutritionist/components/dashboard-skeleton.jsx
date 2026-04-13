import { Skeleton } from '~/components/ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-72' />
        <Skeleton className='h-9 w-24' />
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'>
        {[...Array(5)].map((_, index) => (
          <div key={index} className='rounded-xl border p-6 space-y-2'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-8 w-20' />
          </div>
        ))}
      </div>

      <div className='rounded-xl border p-6 space-y-4'>
        <Skeleton className='h-6 w-44' />
        {[...Array(3)].map((_, index) => (
          <div key={index} className='space-y-2'>
            <div className='flex items-center justify-between gap-4'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-16' />
            </div>
            <Skeleton className='h-2.5 w-full rounded-full' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
