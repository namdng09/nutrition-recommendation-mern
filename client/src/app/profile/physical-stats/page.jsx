import { Suspense } from 'react';

import UpdatePhysicalStats from '~/features/users/update-physical-stats/components/update-physical-stats';
import UpdatePhysicalStatsSkeleton from '~/features/users/update-physical-stats/components/update-physical-stats-skeleton';

const Page = () => {
  return (
    <Suspense fallback={<UpdatePhysicalStatsSkeleton />}>
      <UpdatePhysicalStats />
    </Suspense>
  );
};

export default Page;
