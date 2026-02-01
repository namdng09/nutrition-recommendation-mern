import React from 'react';

import CollectionsList from '~/features/collections/view-collections/components/collection-list';

export default function Page() {
  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-6'>
      <CollectionsList />
    </div>
  );
}
