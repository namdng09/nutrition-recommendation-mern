import React, { useState } from 'react';

import { useGroceries } from '../api/view-grocery';
import GroceryPagination from './grocery-pagination';
import GroceryReceipt from './grocery-receipt';

const GroceryList = () => {
  const [page, setPage] = useState(1);
  const { data } = useGroceries({ page });
  const lists = data?.docs ?? [];

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {lists.map(list => (
          <div key={list._id} className='min-w-0'>
            <GroceryReceipt list={list} />
          </div>
        ))}
      </div>

      <GroceryPagination
        page={page}
        totalPages={data?.totalPages}
        hasPrevPage={data?.hasPrevPage}
        hasNextPage={data?.hasNextPage}
        onPrev={() => setPage(p => Math.max(p - 1, 1))}
        onNext={() => setPage(p => p + 1)}
      />
    </div>
  );
};

export default GroceryList;
