import { Suspense } from 'react';

import { UpdateAllergens } from '~/features/users/update-allergens/components/update-allergens';
import { UpdateAllergensSkeleton } from '~/features/users/update-allergens/components/update-allergens-skeleton';

const Page = () => {
  return (
    <Suspense fallback={<UpdateAllergensSkeleton />}>
      <UpdateAllergens />
    </Suspense>
  );
};

export default Page;
