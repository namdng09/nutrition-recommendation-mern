import React from 'react';

import DishesList from '~/features/dishes/view-dishes/components/dishes-list';

function page() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <DishesList />
    </div>
  );
}

export default page;
