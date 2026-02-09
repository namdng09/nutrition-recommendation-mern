import React, { Suspense } from 'react';

import GroceryHeader from '~/features/grocery/view-grocery/components/grocery-header';
import GroceryList from '~/features/grocery/view-grocery/components/grocery-list';
import GrocerySkeleton from '~/features/grocery/view-grocery/components/grocery-skeleton';

export default function Page() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <GroceryHeader />
      <Suspense fallback={<GrocerySkeleton />}>
        <GroceryList />
      </Suspense>
    </div>
  );
}
