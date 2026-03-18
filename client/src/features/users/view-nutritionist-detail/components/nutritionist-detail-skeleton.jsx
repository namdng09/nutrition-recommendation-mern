import { Avatar } from '~/components/ui/avatar';
import { Skeleton } from '~/components/ui/skeleton';

export default function NutritionistDetailSkeleton() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <Skeleton className='h-9 w-24 mb-8' />

        <div className='bg-primary/5 rounded-2xl p-6 md:p-8'>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='md:w-56 shrink-0 text-center md:text-left'>
              <div className='relative inline-block mb-4'>
                <Avatar className='h-32 w-32 mx-auto md:mx-0'>
                  <Skeleton className='h-full w-full rounded-full' />
                </Avatar>
              </div>

              <Skeleton className='h-8 w-48 mx-auto md:mx-0 mb-2' />
              <Skeleton className='h-5 w-36 mx-auto md:mx-0 mb-4' />
              <Skeleton className='h-7 w-28 mx-auto md:mx-0 rounded-full' />
            </div>

            <div className='flex-1 space-y-6'>
              <div className='bg-background rounded-xl p-5'>
                <Skeleton className='h-4 w-16 mb-2' />
                <Skeleton className='h-4 w-full mb-1' />
                <Skeleton className='h-4 w-3/4' />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-background rounded-xl p-4'>
                  <Skeleton className='h-4 w-20 mb-2' />
                  <Skeleton className='h-5 w-full' />
                </div>
                <div className='bg-background rounded-xl p-4'>
                  <Skeleton className='h-4 w-24 mb-2' />
                  <Skeleton className='h-5 w-full' />
                </div>
              </div>

              <div className='bg-background rounded-xl p-5'>
                <Skeleton className='h-5 w-36 mb-4' />
                <div className='space-y-3'>
                  <Skeleton className='h-5 w-full' />
                  <Skeleton className='h-4 w-48' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
