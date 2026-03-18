import { Suspense } from 'react';
import { useParams } from 'react-router';

import DishDetail from '~/features/dishes/view-dishes-detail/components/admin/dish-detail';
import DishDetailSkeleton from '~/features/dishes/view-dishes-detail/components/admin/dish-detail-skeleton';

const DishDetailPage = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<DishDetailSkeleton />}>
        <DishDetail id={id} />
      </Suspense>
    </div>
  );
};

export default DishDetailPage;
