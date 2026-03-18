import { Skeleton } from '~/components/ui/skeleton';

const PostDetailSkeleton = () => {
  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Back Button */}
      <Skeleton className='h-9 w-32 mb-4' />

      {/* Profile Card */}
      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-start'>
        <Skeleton className='h-32 w-32 rounded-lg' />

        <div className='flex-1 text-center md:text-left space-y-3'>
          <div className='flex items-center justify-center md:justify-start gap-2'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-6 w-20' />
          </div>
          <div className='flex gap-1.5 flex-wrap justify-center md:justify-start'>
            <Skeleton className='h-5 w-24' />
          </div>
          <div className='flex gap-1.5 flex-wrap justify-center md:justify-start'>
            <Skeleton className='h-5 w-16' />
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-5 w-16' />
          </div>
          <div className='flex gap-2 flex-wrap justify-center md:justify-start'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-5 w-24' />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-20' />
        </div>
      </div>

      {/* Content */}
      <div className='bg-card rounded-lg border p-6 space-y-6'>
        <Skeleton className='h-6 w-48' />

        {/* Basic Info */}
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-5 w-full' />
            </div>
          ))}

          <div className='grid grid-cols-2 gap-4'>
            {[...Array(2)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-5 w-32' />
              </div>
            ))}
          </div>

          <div className='grid grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-5 w-28' />
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <Skeleton className='h-px w-full' />

        {/* Content */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-24' />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className='h-4 w-full' />
          ))}
        </div>

        {/* Separator */}
        <Skeleton className='h-px w-full' />

        {/* Images */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-32' />
          <div className='grid grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-32 w-full rounded' />
            ))}
          </div>
        </div>

        {/* Separator */}
        <Skeleton className='h-px w-full' />

        {/* Tags */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-16' />
          <div className='flex gap-2'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-6 w-20' />
            ))}
          </div>
        </div>

        {/* Separator */}
        <Skeleton className='h-px w-full' />

        {/* Statistics */}
        <div className='space-y-4'>
          <Skeleton className='h-5 w-24' />
          <div className='grid grid-cols-4 gap-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='p-3 bg-muted rounded-lg space-y-2'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-8 w-12' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailSkeleton;
