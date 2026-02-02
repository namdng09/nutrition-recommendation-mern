import { Skeleton } from '~/components/ui/skeleton';

const ProfileSkeleton = () => {
  return (
    <div className='px-4 sm:px-6'>
      {/* Page Header */}
      <div className='mb-4 flex items-center gap-2'>
        <Skeleton className='h-7 w-7 rounded' />
        <Skeleton className='h-8 w-40' />
      </div>

      {/* Profile Card */}
      <div className='flex flex-col gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-20 w-20 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-64' />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-20 rounded-xl' />
          <Skeleton className='h-9 w-28 rounded-xl' />
        </div>
      </div>

      {/* Personal Information Form Card */}
      <div className='mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm'>
        <div className='mb-4 space-y-1'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-4 w-72' />
        </div>

        {/* 2-column grid form */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full rounded-xl' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
