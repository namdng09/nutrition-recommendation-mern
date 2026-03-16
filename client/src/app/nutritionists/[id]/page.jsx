import { Suspense } from 'react';
import { useParams } from 'react-router';

import NutritionistDetail from '~/features/users/view-nutritionist-detail/components/nutritionist-detail';
import NutritionistDetailSkeleton from '~/features/users/view-nutritionist-detail/components/nutritionist-detail-skeleton';

const Page = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<NutritionistDetailSkeleton />}>
        <NutritionistDetail id={id} />
      </Suspense>
    </div>
  );
};

export default Page;
