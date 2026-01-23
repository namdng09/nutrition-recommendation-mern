import { Skeleton } from '~/components/ui/skeleton';

const UserDetailSkeleton = () => {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-8 w-32' />
      <Skeleton className='h-40 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  );
};

export default UserDetailSkeleton;
