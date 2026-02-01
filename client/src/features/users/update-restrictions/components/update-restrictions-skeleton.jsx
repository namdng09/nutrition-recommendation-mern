import { Skeleton } from '~/components/ui/skeleton';

export function UpdateRestrictionsSkeleton() {
  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Skeleton className='h-7 w-7 rounded' />
        <Skeleton className='h-8 w-48' />
      </div>

      <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
        <div className='mb-6 space-y-2'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-4 w-64' />
        </div>

        <div className='space-y-6'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full rounded-xl' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full rounded-xl' />
            <Skeleton className='h-3 w-56' />
          </div>
          <div className='flex justify-end pt-4'>
            <Skeleton className='h-10 w-32 rounded-xl' />
          </div>
        </div>
      </div>
    </div>
  );
}
