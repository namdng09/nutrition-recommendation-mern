import { Skeleton } from '~/components/ui/skeleton';

const FeedbackSkeleton = () => {
  return (
    <>
      <div className='rounded-md border'>
        <div className='border-b bg-muted/50'>
          <div className='flex items-center h-12 px-4'>
            <div className='flex items-center gap-4 w-full'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-4 w-24 ml-auto' />
            </div>
          </div>
        </div>

        <div className='divide-y'>
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className='flex items-center h-16 px-4'>
              <div className='flex items-center gap-4 w-full'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-4 w-[26rem]' />
                <Skeleton className='h-4 w-28 ml-auto' />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='flex items-center justify-between px-2 py-4'>
        <Skeleton className='h-4 w-40' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-24' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-24' />
        </div>
      </div>
    </>
  );
};

export default FeedbackSkeleton;
