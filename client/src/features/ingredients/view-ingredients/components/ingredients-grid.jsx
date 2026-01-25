import React from 'react';

import IngredientCard from './ingredient-card';

export default function IngredientsGrid({ items }) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {items.map(item => (
        <IngredientCard key={item._id} item={item} />
      ))}
    </div>
  );
}
