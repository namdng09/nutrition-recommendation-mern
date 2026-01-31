import { Suspense } from 'react';

import { UpdateNutritionTarget } from '~/features/users/update-nutrition-target/components/update-nutrition-target';
import { UpdateNutritionTargetSkeleton } from '~/features/users/update-nutrition-target/components/update-nutrition-target-skeleton';

const Page = () => {
  return (
    <Suspense fallback={<UpdateNutritionTargetSkeleton />}>
      <UpdateNutritionTarget />
    </Suspense>
  );
};

export default Page;
