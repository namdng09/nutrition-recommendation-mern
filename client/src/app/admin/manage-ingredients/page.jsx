import { Suspense } from 'react';

import IngredientsFilter from '~/features/ingredients/view-ingredients/components/nutritionist/ingredients-filter';
import IngredientsTable from '~/features/ingredients/view-ingredients/components/nutritionist/ingredients-table';
import IngredientsTableSkeleton from '~/features/ingredients/view-ingredients/components/nutritionist/ingredients-table-skeleton';

const Page = () => {
  return (
    <div className='space-y-4'>
      {/* Filter - Hide Create Button */}
      <IngredientsFilter hideCreateButton={true} />

      {/* Table - View only mode */}
      <Suspense fallback={<IngredientsTableSkeleton />}>
        <IngredientsTable viewDetailPath='/ingredients' />
      </Suspense>
    </div>
  );
};

export default Page;
