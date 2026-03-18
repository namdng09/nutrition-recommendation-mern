import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export default function NutritionistDetailSkeleton() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <Skeleton className='h-9 w-40 mb-8' />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-1'>
            <div className='sticky top-8'>
              <div className='bg-card border border-border rounded-3xl p-6 md:p-8 text-center'>
                <div className='relative inline-block mb-6'>
                  <Skeleton className='h-28 w-28 md:h-32 md:w-32 rounded-full' />
                </div>
                <Skeleton className='h-7 w-40 mx-auto mb-2' />
                <Skeleton className='h-4 w-32 mx-auto mb-4' />
                <Skeleton className='h-6 w-24 mx-auto rounded-full' />
              </div>
            </div>
          </div>

          <div className='lg:col-span-2 space-y-6'>
            <Card className='border-border/50'>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-3'>
                  <Skeleton className='h-10 w-10 rounded-xl shrink-0' />
                  <div className='flex-1'>
                    <Skeleton className='h-5 w-24 mb-2' />
                    <Skeleton className='h-4 w-full mb-1' />
                    <Skeleton className='h-4 w-3/4' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Card className='border-border/50'>
                <CardContent className='pt-6'>
                  <div className='flex items-start gap-3'>
                    <Skeleton className='h-8 w-8 rounded-lg shrink-0' />
                    <div>
                      <Skeleton className='h-3 w-20 mb-2' />
                      <Skeleton className='h-5 w-full' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-border/50'>
                <CardContent className='pt-6'>
                  <div className='flex items-start gap-3'>
                    <Skeleton className='h-8 w-8 rounded-lg shrink-0' />
                    <div>
                      <Skeleton className='h-3 w-24 mb-2' />
                      <Skeleton className='h-5 w-full' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className='border-border/50'>
              <CardContent className='pt-6'>
                <Skeleton className='h-6 w-36 mb-6' />
                <div className='space-y-4'>
                  <Skeleton className='h-20 w-full rounded-2xl' />
                  <div className='grid grid-cols-2 gap-4'>
                    <Skeleton className='h-20 w-full rounded-2xl' />
                    <Skeleton className='h-20 w-full rounded-2xl' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
