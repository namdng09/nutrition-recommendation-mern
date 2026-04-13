import { Skeleton } from '~/components/ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Skeleton className='h-8 w-56' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-44' />
          <Skeleton className='h-9 w-28' />
          <Skeleton className='h-9 w-28' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {[...Array(4)].map((_, index) => (
          <div key={index} className='rounded-xl border p-6 space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-8 w-32' />
          </div>
        ))}
      </div>

      <div className='rounded-xl border p-6 space-y-4'>
        <Skeleton className='h-6 w-40' />
        {[...Array(3)].map((_, index) => (
          <div key={index} className='flex items-center justify-between gap-4'>
            <Skeleton className='h-5 w-44' />
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-5 w-28' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
