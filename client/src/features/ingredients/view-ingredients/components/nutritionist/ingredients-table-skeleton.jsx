import { Skeleton } from '~/components/ui/skeleton';

const IngredientsTableSkeleton = () => {
  return (
    <>
      <div className='rounded-md border'>
        <div className='border-b bg-muted/50'>
          <div className='flex items-center h-12 px-4'>
            <div className='flex items-center gap-4 w-full'>
              <Skeleton className='h-4 w-4' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-20 ml-auto' />
            </div>
          </div>
        </div>

        <div className='divide-y'>
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className='flex items-center h-16 px-4'>
              <div className='flex items-center gap-4 w-full'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-10 w-10 rounded' />
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-20' />
                <div className='flex items-center gap-2 ml-auto'>
                  <Skeleton className='h-8 w-8' />
                  <Skeleton className='h-8 w-8' />
                </div>
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

export default IngredientsTableSkeleton;
