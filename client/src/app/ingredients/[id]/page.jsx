import { Suspense } from 'react';

import IngredientDetail from '~/features/ingredients/view-ingredients-detail/components/ingredient-detail';
import IngredientDetailSkeleton from '~/features/ingredients/view-ingredients-detail/components/ingredient-detail-skeleton';

const Page = () => {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<IngredientDetailSkeleton />}>
        <IngredientDetail />
      </Suspense>
    </div>
  );
};

export default Page;
