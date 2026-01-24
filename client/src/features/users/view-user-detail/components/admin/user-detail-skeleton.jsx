import { Skeleton } from '~/components/ui/skeleton';

const UserDetailSkeleton = () => {
  return (
    <div className='max-w-4xl mx-auto'>
      {/* Back Button */}
      <Skeleton className='h-9 w-32 mb-4' />

      {/* Profile Card */}
      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-center'>
        <Skeleton className='h-24 w-24 rounded-full' />

        <div className='flex-1 text-center md:text-left space-y-2'>
          <div className='flex items-center justify-center md:justify-start gap-2'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-6 w-16' />
          </div>
          <Skeleton className='h-4 w-56' />
          <Skeleton className='h-6 w-20' />
        </div>

        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-20' />
        </div>
      </div>

      {/* User Information Form Card */}
      <div className='bg-card rounded-lg border p-6'>
        <Skeleton className='h-6 w-48 mb-4' />

        {/* 2-column grid form */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>

        {/* Delete Section */}
        <div className='flex justify-start items-center mt-6 pt-6 border-t'>
          <Skeleton className='h-9 w-32' />
        </div>
      </div>
    </div>
  );
};

export default UserDetailSkeleton;
