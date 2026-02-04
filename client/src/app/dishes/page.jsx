import React, { Suspense } from 'react';

import DishSkeleton from '~/features/dishes/view-dishes/components/dish-skeleton';
import DishesList from '~/features/dishes/view-dishes/components/dishes-list';

function page() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<DishSkeleton />}>
        <DishesList />
      </Suspense>
    </div>
  );
}

export default page;
