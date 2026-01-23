import { Skeleton } from '~/components/ui/skeleton';

const UsersTableSkeleton = () => {
  return (
    <>
      {/* Table Container */}
      <div className='rounded-md border'>
        {/* Table Header */}
        <div className='border-b bg-muted/50'>
          <div className='flex items-center h-12 px-4'>
            {/* 7 columns: checkbox, avatar, name, email, gender, role, status, actions */}
            <div className='flex items-center gap-4 w-full'>
              <Skeleton className='h-4 w-4' /> {/* Checkbox */}
              <Skeleton className='h-4 w-16' /> {/* Avatar header */}
              <Skeleton className='h-4 w-20' /> {/* Name header */}
              <Skeleton className='h-4 w-16' /> {/* Email header */}
              <Skeleton className='h-4 w-20' /> {/* Gender header */}
              <Skeleton className='h-4 w-16' /> {/* Role header */}
              <Skeleton className='h-4 w-16' /> {/* Status header */}
              <Skeleton className='h-4 w-20 ml-auto' /> {/* Actions header */}
            </div>
          </div>
        </div>

        {/* Table Body - 5 rows */}
        <div className='divide-y'>
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className='flex items-center h-16 px-4'>
              <div className='flex items-center gap-4 w-full'>
                <Skeleton className='h-4 w-4' /> {/* Checkbox */}
                <Skeleton className='h-10 w-10 rounded-full' /> {/* Avatar */}
                <Skeleton className='h-4 w-32' /> {/* Name */}
                <Skeleton className='h-4 w-48' /> {/* Email */}
                <Skeleton className='h-4 w-16' /> {/* Gender */}
                <Skeleton className='h-4 w-20' /> {/* Role */}
                <Skeleton className='h-4 w-16' /> {/* Status */}
                <div className='flex items-center gap-2 ml-auto'>
                  <Skeleton className='h-8 w-8' /> {/* View button */}
                  <Skeleton className='h-8 w-8' /> {/* Delete button */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between px-2 py-4'>
        <Skeleton className='h-4 w-40' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-24' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-8 w-24' />
        </div>
      </div>
    </>
  );
};

export default UsersTableSkeleton;
