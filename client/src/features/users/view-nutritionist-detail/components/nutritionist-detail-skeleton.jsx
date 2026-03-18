import { Skeleton } from '~/components/ui/skeleton';

export default function NutritionistDetailSkeleton() {
  return (
    <div className='mx-auto max-w-2xl space-y-6 animate-in fade-in duration-500'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-20 w-20 rounded-full shrink-0' />
        <div className='space-y-2'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-32' />
        </div>
      </div>
      <div className='rounded-lg border border-border p-5 space-y-4'>
        <Skeleton className='h-5 w-36' />
        <div className='space-y-2'>
          <Skeleton className='h-3 w-16' />
          <Skeleton className='h-4 w-56' />
        </div>
        <Skeleton className='h-6 w-32 rounded-full' />
        <Skeleton className='h-4 w-40' />
      </div>
    </div>
  );
}
