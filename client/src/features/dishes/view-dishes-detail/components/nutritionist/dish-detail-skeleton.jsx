import { Skeleton } from '~/components/ui/skeleton';

const DishDetailSkeleton = () => {
  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Back Button */}
      <Skeleton className='h-9 w-32 mb-4' />

      {/* Profile Card */}
      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-start'>
        <Skeleton className='h-32 w-32 rounded-lg' />

        <div className='flex-1 text-center md:text-left space-y-3'>
          <div className='flex items-center justify-center md:justify-start gap-2'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-6 w-20' />
          </div>
          <div className='flex gap-1.5 flex-wrap justify-center md:justify-start'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-5 w-24' />
          </div>
          <div className='flex gap-2 flex-wrap justify-center md:justify-start'>
            <Skeleton className='h-5 w-16' />
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-5 w-16' />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-20' />
        </div>
      </div>

      {/* Content */}
      <div className='bg-card rounded-lg border p-6 space-y-6'>
        <Skeleton className='h-6 w-48' />

        {/* Basic Info */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-24 w-full' />
          </div>
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-32' />
          {[...Array(3)].map((_, i) => (
            <div key={i} className='p-4 border rounded-lg'>
              <div className='flex items-start gap-3'>
                <Skeleton className='h-16 w-16 rounded' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-4 w-full' />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-32' />
          {[...Array(3)].map((_, i) => (
            <div key={i} className='p-4 border rounded-lg space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-20 w-full' />
            </div>
          ))}
        </div>

        {/* Delete Button */}
        <div className='flex justify-start items-center pt-6 border-t'>
          <Skeleton className='h-9 w-32' />
        </div>
      </div>
    </div>
  );
};

export default DishDetailSkeleton;
