import { Suspense } from 'react';

import { UpdateRestrictions } from '~/features/users/update-restrictions/components/update-restrictions';
import { UpdateRestrictionsSkeleton } from '~/features/users/update-restrictions/components/update-restrictions-skeleton';

const Page = () => {
  return (
    <Suspense fallback={<UpdateRestrictionsSkeleton />}>
      <UpdateRestrictions />
    </Suspense>
  );
};

export default Page;
