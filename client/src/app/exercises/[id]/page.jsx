import React, { Suspense } from 'react';

import ExerciseDetail from '~/features/exercise/view-exercise-detail/components/exercise-detail';
import ExerciseDetailSkeleton from '~/features/exercise/view-exercise-detail/components/exercise-detail-skeleton';

function page() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<ExerciseDetailSkeleton />}>
        <ExerciseDetail />
      </Suspense>
    </div>
  );
}

export default page;
