import { Skeleton } from '~/components/ui/skeleton';

const UsersTableSkeleton = () => {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  );
};

export default UsersTableSkeleton;
