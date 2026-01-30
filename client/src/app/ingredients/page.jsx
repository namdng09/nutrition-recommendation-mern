import { Suspense } from 'react';

import IngredientsList from '~/features/ingredients/view-ingredients/components/ingredients-list';
import IngredientsSkeleton from '~/features/ingredients/view-ingredients/components/ingredients-skeleton';

const Page = () => {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<IngredientsSkeleton />}>
        <IngredientsList />
      </Suspense>
    </div>
  );
};

export default Page;
