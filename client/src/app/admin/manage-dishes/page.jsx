import { Suspense } from 'react';

import DishesFilter from '~/features/dishes/view-dishes/components/nutritionist/dishes-filter';
import DishesTable from '~/features/dishes/view-dishes/components/nutritionist/dishes-table';
import DishesTableSkeleton from '~/features/dishes/view-dishes/components/nutritionist/dishes-table-skeleton';

const Page = () => {
  return (
    <div className='space-y-4'>
      {/* Filter - Hide Create Button */}
      <DishesFilter hideCreateButton={true} />

      {/* Table - View only mode */}
      <Suspense fallback={<DishesTableSkeleton />}>
        <DishesTable viewDetailPath='/dishes' />
      </Suspense>
    </div>
  );
};

export default Page;
