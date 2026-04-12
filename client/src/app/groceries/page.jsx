import React, { Suspense, useState } from 'react';

import GroceryHeader from '~/features/grocery/view-grocery/components/grocery-header';
import GroceryList from '~/features/grocery/view-grocery/components/grocery-list';
import GrocerySkeleton from '~/features/grocery/view-grocery/components/grocery-skeleton';

export default function Page() {
  const [filters, setFilters] = useState({
    name: '',
    status: 'all',
    sort: '-createdAt'
  });
  const [page, setPage] = useState(1);

  const handleFilterChange = newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <GroceryHeader filters={filters} onFilterChange={handleFilterChange} />
      <Suspense fallback={<GrocerySkeleton />}>
        <GroceryList filters={filters} page={page} onPageChange={setPage} />
      </Suspense>
    </div>
  );
}
