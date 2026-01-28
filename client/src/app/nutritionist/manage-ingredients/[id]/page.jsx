import { Suspense } from 'react';
import { useParams } from 'react-router';

import IngredientDetail from '~/features/ingredients/view-ingredients-detail/components/nutritionist/ingredient-detail';
import IngredientDetailSkeleton from '~/features/ingredients/view-ingredients-detail/components/nutritionist/ingredient-detail-skeleton';

const Page = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<IngredientDetailSkeleton />}>
        <IngredientDetail id={id} />
      </Suspense>
    </div>
  );
};

export default Page;
