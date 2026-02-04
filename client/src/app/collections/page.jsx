import React, { Suspense } from 'react';

import CollectionsList from '~/features/collections/view-collections/components/collection-list';
import CollectionSkeleton from '~/features/collections/view-collections/components/collection-skeleton';

export default function Page() {
  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-6'>
      <Suspense fallback={<CollectionSkeleton />}>
        <CollectionsList />
      </Suspense>
    </div>
  );
}
