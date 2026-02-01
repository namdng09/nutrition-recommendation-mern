import React, { Suspense } from 'react';

import DishDetail from '~/features/dishes/view-dishes-detail/components/dish-detail';
import DishDetailSkeleton from '~/features/dishes/view-dishes-detail/components/dish-detail-skeleton';

function page() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<DishDetailSkeleton />}>
        <DishDetail />
      </Suspense>
    </div>
  );
}

export default page;
