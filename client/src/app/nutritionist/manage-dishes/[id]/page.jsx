import { Suspense } from 'react';
import { useParams } from 'react-router';

import DishDetail from '~/features/dishes/view-dishes-detail/components/nutritionist/dish-detail';
import DishDetailSkeleton from '~/features/dishes/view-dishes-detail/components/nutritionist/dish-detail-skeleton';

const Page = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<DishDetailSkeleton />}>
        <DishDetail id={id} />
      </Suspense>
    </div>
  );
};

export default Page;
