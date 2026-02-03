import { Suspense } from 'react';

import DishesFilter from '~/features/dishes/view-dishes/components/nutritionist/dishes-filter';
import DishesTable from '~/features/dishes/view-dishes/components/nutritionist/dishes-table';
import DishesTableSkeleton from '~/features/dishes/view-dishes/components/nutritionist/dishes-table-skeleton';
const Page = () => {
  return (
    <div className='space-y-4'>
      <DishesFilter />
      <Suspense fallback={<DishesTableSkeleton />}>
        <DishesTable />
      </Suspense>
    </div>
  );
};

export default Page;
