import { Skeleton } from '~/components/ui/skeleton';

const ProfileSkeleton = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-20 w-20 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>
      </div>
      <Skeleton className='h-96 w-full' />
    </div>
  );
};

export default ProfileSkeleton;
