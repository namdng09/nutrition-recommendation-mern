// Skeleton component: achievements-list-skeleton.jsx
import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

function AchievementCardSkeleton() {
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-start gap-4'>
          <Skeleton className='h-14 w-14 rounded-xl' />
          <div className='flex-1 space-y-3'>
            <Skeleton className='h-5 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategorySkeleton() {
  return (
    <div className='space-y-4'>
      <Card className='p-6'>
        <div className='space-y-4'>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-7 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
            <Skeleton className='h-6 w-12' />
          </div>
          <Skeleton className='h-2 w-full' />
        </div>
      </Card>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(3)].map((_, i) => (
          <AchievementCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AchievementsListSkeleton() {
  return (
    <div className='w-full space-y-8'>
      {/* Header Skeleton */}
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-12 w-12 rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-64' />
          </div>
        </div>

        <Card>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-7 w-32' />
                </div>
                <Skeleton className='h-16 w-16 rounded-full' />
              </div>
              <Skeleton className='h-3 w-full' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Skeleton */}
      <div className='space-y-12'>
        {[...Array(3)].map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default AchievementsListSkeleton;
