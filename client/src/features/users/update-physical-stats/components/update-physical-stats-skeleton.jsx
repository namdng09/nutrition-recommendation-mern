import { Activity } from 'lucide-react';

const UpdatePhysicalStatsSkeleton = () => {
  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Activity className='h-7 w-7 animate-pulse' />
        <div className='h-8 w-32 bg-muted animate-pulse rounded' />
      </div>
      <div className='h-4 w-full max-w-md bg-muted animate-pulse rounded mb-6' />

      <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                <div className='h-10 w-full bg-muted animate-pulse rounded-xl' />
              </div>
            ))}
          </div>

          <div className='flex justify-end'>
            <div className='h-10 w-32 bg-muted animate-pulse rounded-xl' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePhysicalStatsSkeleton;
