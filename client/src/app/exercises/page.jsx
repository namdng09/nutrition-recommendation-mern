import React, { Suspense } from 'react';

import ExerciseHeader from '~/features/exercise/view-exercise/components/exercise-header';
import ExerciseList from '~/features/exercise/view-exercise/components/exercise-list';
import ExerciseSkeleton from '~/features/exercise/view-exercise/components/exercise-skeleton';

export default function Page() {
  return (
    <div className='container mx-auto px-4'>
      <Suspense fallback={<ExerciseSkeleton />}>
        <ExerciseList />
      </Suspense>
    </div>
  );
}
