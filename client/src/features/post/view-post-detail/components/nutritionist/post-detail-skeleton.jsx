import { Skeleton } from '~/components/ui/skeleton';

const PostDetailSkeleton = () => {
  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Back Button */}
      <Skeleton className='h-9 w-32 mb-4' />

      {/* Profile Card */}
      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-start'>
        <Skeleton className='h-32 w-32 rounded-lg' />

        <div className='flex-1 text-center md:text-left space-y-2'>
          <div className='flex items-center justify-center md:justify-start gap-2'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-6 w-24' />
          </div>
          <Skeleton className='h-4 w-32' />
          <div className='flex gap-2 flex-wrap justify-center md:justify-start'>
            <Skeleton className='h-5 w-16' />
            <Skeleton className='h-5 w-16' />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-20' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>

      {/* Images Gallery */}
      <div className='bg-card rounded-lg border p-6 mb-6'>
        <Skeleton className='h-6 w-32 mb-4' />
        <div className='grid grid-cols-5 gap-3'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-24 w-full rounded-lg' />
          ))}
        </div>
      </div>

      {/* Post Information Form Card */}
      <div className='bg-card rounded-lg border p-6'>
        <Skeleton className='h-6 w-48 mb-6' />

        {/* Form fields */}
        <div className='space-y-4'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>

        {/* Tags Section */}
        <div className='mt-6 pt-6 border-t'>
          <Skeleton className='h-5 w-32 mb-3' />
          <div className='flex gap-2 flex-wrap'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-8 w-20' />
            ))}
          </div>
        </div>

        {/* Delete Section */}
        <div className='flex justify-between items-center mt-6 pt-6 border-t'>
          <Skeleton className='h-9 w-32' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>
    </div>
  );
};

export default PostDetailSkeleton;
