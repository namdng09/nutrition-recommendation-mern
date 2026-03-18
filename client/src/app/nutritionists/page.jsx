import { Suspense } from 'react';

import NutritionistsFilter from '~/features/users/view-nutritionist/components/nutritionists-filter';
import NutritionistsList from '~/features/users/view-nutritionist/components/nutritionists-list';
import NutritionistsListSkeleton from '~/features/users/view-nutritionist/components/nutritionists-list-skeleton';

const Page = () => {
  return (
    <div className='container mx-auto py-8 px-4 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Chuyên gia dinh dưỡng</h1>
        <p className='text-muted-foreground mt-1'>
          Danh sách các chuyên gia dinh dưỡng trên hệ thống
        </p>
      </div>
      <NutritionistsFilter />
      <Suspense fallback={<NutritionistsListSkeleton />}>
        <NutritionistsList />
      </Suspense>
    </div>
  );
};

export default Page;
