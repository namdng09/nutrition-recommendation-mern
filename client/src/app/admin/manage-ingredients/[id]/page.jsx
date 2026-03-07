import { Suspense } from 'react';
import { useParams } from 'react-router';

import IngredientDetail from '~/features/ingredients/view-ingredients-detail/components/admin/ingredient-detail';
import IngredientDetailSkeleton from '~/features/ingredients/view-ingredients-detail/components/admin/ingredient-detail-skeleton';

const IngredientDetailPage = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<IngredientDetailSkeleton />}>
        <IngredientDetail id={id} />
      </Suspense>
    </div>
  );
};

export default IngredientDetailPage;
