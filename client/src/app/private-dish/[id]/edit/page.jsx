import React, { Suspense } from 'react';

import EditPrivateDish from '~/features/private-dish/update-private-dish/components/edit-private-dish';
import EditPrivateDishSkeleton from '~/features/private-dish/update-private-dish/components/edit-private-dish-skeleton';

function Page() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Suspense fallback={<EditPrivateDishSkeleton />}>
        <EditPrivateDish />
      </Suspense>
    </div>
  );
}

export default Page;
