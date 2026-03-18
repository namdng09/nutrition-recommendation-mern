import { Skeleton } from '~/components/ui/skeleton';

const ExerciseDetailSkeleton = () => {
  return (
    <div className='max-w-4xl mx-auto'>
      <Skeleton className='h-9 w-40 mb-4' />

      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-center'>
        <Skeleton className='h-24 w-24 rounded-full' />
        <div className='flex-1 space-y-2 text-center md:text-left'>
          <Skeleton className='h-8 w-48 mx-auto md:mx-0' />
          <Skeleton className='h-4 w-32 mx-auto md:mx-0' />
          <Skeleton className='h-6 w-20 mx-auto md:mx-0' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-16' />
        </div>
      </div>

      <div className='bg-card rounded-lg border p-6'>
        <Skeleton className='h-6 w-48 mb-4' />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>

        <div className='mt-6'>
          <Skeleton className='h-4 w-24 mb-2' />
          <Skeleton className='h-24 w-full' />
        </div>

        <div className='mt-6'>
          <Skeleton className='h-4 w-32 mb-2' />
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-8 w-20' />
            ))}
          </div>
        </div>

        <div className='mt-6'>
          <Skeleton className='h-4 w-32 mb-2' />
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-8 w-24' />
            ))}
          </div>
        </div>

        <div className='flex justify-start items-center mt-6 pt-6 border-t'>
          <Skeleton className='h-9 w-32' />
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailSkeleton;
