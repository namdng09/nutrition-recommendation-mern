import { Skeleton } from '~/components/ui/skeleton';

const IngredientDetailSkeleton = () => {
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
          <Skeleton className='h-9 w-20' />
        </div>
      </div>

      {/* Nutrition Chart */}
      <div className='bg-card rounded-lg border p-6 mb-6'>
        <Skeleton className='h-6 w-48 mb-4' />
        <div className='flex flex-col md:flex-row items-center gap-6'>
          <Skeleton className='w-64 h-64 rounded-full' />
          <div className='flex-1 space-y-3 w-full'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-6 w-full' />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-5 w-full' />
            ))}
            <Skeleton className='h-px w-full my-3' />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-4 w-full' />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='bg-card rounded-lg border p-6 space-y-6'>
        <Skeleton className='h-6 w-48' />

        {/* Basic Info */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-20 w-full' />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-16' />
                <Skeleton className='h-6 w-20' />
              </div>
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-24' />
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-5 w-24' />
          </div>
        </div>

        {/* Separator */}
        <Skeleton className='h-px w-full' />

        {/* Nutrients */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-40' />
          <div className='grid grid-cols-2 gap-3'>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        </div>

        {/* Separator */}
        <Skeleton className='h-px w-full' />

        {/* Minerals */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-32' />
          <div className='grid grid-cols-2 gap-3'>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        </div>

        {/* Separator */}
        <Skeleton className='h-px w-full' />

        {/* Vitamins */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-24' />
          <div className='grid grid-cols-2 gap-3'>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientDetailSkeleton;
