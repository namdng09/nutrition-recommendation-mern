import React, { Suspense } from 'react';

import CollectionDetailSkeleton from '~/features/collections/view-collections-detail/components/collection-detail-skeleton';
import CollectionDetail from '~/features/collections/view-collections-detail/components/collections-detail';

export default function Page() {
  return (
    <div className='mx-auto w-full max-w-7xl px-4 pt-6'>
      <Suspense fallback={<CollectionDetailSkeleton />}>
        <CollectionDetail />
      </Suspense>
    </div>
  );
}
