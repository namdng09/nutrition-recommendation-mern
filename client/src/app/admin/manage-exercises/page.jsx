import { Suspense } from 'react';

import ExercisesFilter from '~/features/exercises/view-exercises/admin/exercise-filter';
import ExercisesTableSkeleton from '~/features/exercises/view-exercises/admin/exercise-table-skeleton';
import ExercisesTable from '~/features/exercises/view-exercises/admin/exercises-table';

const Page = () => {
  return (
    <div className='space-y-4'>
      <ExercisesFilter />

      <Suspense fallback={<ExercisesTableSkeleton />}>
        <ExercisesTable />
      </Suspense>
    </div>
  );
};

export default Page;
