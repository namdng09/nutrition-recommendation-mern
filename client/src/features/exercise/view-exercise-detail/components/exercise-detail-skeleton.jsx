import { Skeleton } from '~/components/ui/skeleton';

export default function ExerciseDetailSkeleton() {
  return (
    <div className='max-w-5xl mx-auto px-4 py-10 space-y-10 animate-pulse'>
      {/* MEDIA */}
      <Skeleton className='w-full aspect-video rounded-2xl' />

      {/* TITLE */}
      <div className='space-y-4'>
        <Skeleton className='h-8 w-2/3 rounded-md' />

        {/* META */}
        <div className='flex gap-6'>
          <Skeleton className='h-5 w-24 rounded-md' />
          <Skeleton className='h-5 w-24 rounded-md' />
        </div>
      </div>

      {/* MUSCLES */}
      <div className='space-y-3'>
        <Skeleton className='h-6 w-32 rounded-md' />

        <div className='flex flex-wrap gap-3'>
          <Skeleton className='h-8 w-24 rounded-full' />
          <Skeleton className='h-8 w-24 rounded-full' />
          <Skeleton className='h-8 w-24 rounded-full' />
          <Skeleton className='h-8 w-24 rounded-full' />
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className='space-y-4'>
        <Skeleton className='h-6 w-40 rounded-md' />

        <div className='space-y-2'>
          <Skeleton className='h-4 w-full rounded-md' />
          <Skeleton className='h-4 w-full rounded-md' />
          <Skeleton className='h-4 w-5/6 rounded-md' />
          <Skeleton className='h-4 w-4/6 rounded-md' />
        </div>
      </div>
    </div>
  );
}
