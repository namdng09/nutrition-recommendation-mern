'use client';

import { Suspense } from 'react';
import { useParams } from 'react-router';

import ExerciseDetail from '~/features/exercises/view-exercise-detail/admin/exercise-detail';
import ExerciseDetailSkeleton from '~/features/exercises/view-exercise-detail/admin/exercise-detail-skeleton';

const Page = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<ExerciseDetailSkeleton />}>
        <ExerciseDetail id={id} />
      </Suspense>
    </div>
  );
};

export default Page;
