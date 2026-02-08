import React from 'react';

import { useGroceries } from '../api/view-grocery';
import GroceryReceipt from './grocery-receipt';

const GroceryList = () => {
  const { data } = useGroceries();
  const lists = data?.docs || [];

  return (
    <div className='grid gap-12 md:grid-cols-2'>
      {lists.map(list => (
        <GroceryReceipt key={list._id} list={list} />
      ))}
    </div>
  );
};

export default GroceryList;
