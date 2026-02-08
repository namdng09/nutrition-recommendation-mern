import React, { Suspense } from 'react';

import DishNutritionDetail from '~/features/dishes/view-dish-nutrition-detail/components/dish-nutrition-detail';
import DishNutritionDetailSkeleton from '~/features/dishes/view-dish-nutrition-detail/components/dish-nutrition-detail-skeleton';

function page() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<DishNutritionDetailSkeleton />}>
        <DishNutritionDetail />
      </Suspense>
    </div>
  );
}

export default page;
