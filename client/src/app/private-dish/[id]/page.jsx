import React, { Suspense } from 'react';

import PrivateDishDetail from '~/features/private-dish/view-private-dish-detail/components/private-dish-detail';
import PrivateDishDetailSkeleton from '~/features/private-dish/view-private-dish-detail/components/private-dish-detail-skeleton';

function page() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Suspense fallback={<PrivateDishDetailSkeleton />}>
        <PrivateDishDetail />
      </Suspense>
    </div>
  );
}

export default page;
