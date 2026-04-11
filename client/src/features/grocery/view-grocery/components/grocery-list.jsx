import React, { useEffect, useState } from 'react';

import { useGroceries } from '../api/view-grocery';
import GroceryPagination from './grocery-pagination';
import GroceryReceipt from './grocery-receipt';

const GroceryList = ({ filters = {}, page = 1, onPageChange }) => {
  const { data } = useGroceries(filters, page);
  const lists = data?.docs ?? [];
  const [expandedIds, setExpandedIds] = useState([]);

  const visibleLists = lists.filter(list => {
    const status = filters?.status ?? 'all';

    if (status === 'done') {
      return (
        list.ingredients.length > 0 &&
        list.ingredients.every(item => item.isPurchased)
      );
    }

    if (status === 'pending') {
      return (
        list.ingredients.length === 0 ||
        list.ingredients.some(item => !item.isPurchased)
      );
    }

    return true;
  });

  useEffect(() => {
    if (!visibleLists.length) {
      setExpandedIds([]);
      return;
    }

    setExpandedIds(prev => {
      const visibleIdSet = new Set(visibleLists.map(item => item._id));
      const next = prev.filter(id => visibleIdSet.has(id));

      if (next.length === 0 && visibleLists[0]?._id) {
        return [visibleLists[0]._id];
      }

      return next;
    });
  }, [visibleLists]);

  const handleToggle = id => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {visibleLists.map(list => (
          <div key={list._id} className='min-w-0'>
            <GroceryReceipt
              list={list}
              isExpanded={expandedIds.includes(list._id)}
              onToggle={() => handleToggle(list._id)}
            />
          </div>
        ))}
      </div>

      <GroceryPagination
        page={page}
        totalPages={data?.totalPages}
        hasPrevPage={data?.hasPrevPage}
        hasNextPage={data?.hasNextPage}
        onPrev={() => onPageChange(Math.max(page - 1, 1))}
        onNext={() => onPageChange(page + 1)}
      />
    </div>
  );
};

export default GroceryList;
