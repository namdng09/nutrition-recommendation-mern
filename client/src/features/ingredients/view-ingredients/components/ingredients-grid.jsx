import React from 'react';
import { Link } from 'react-router';

import IngredientCard from './ingredient-card';

export default function IngredientsGrid({ items }) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {items.map(item => (
        <Link key={item._id} to={`/ingredients/${item._id}`} className='block'>
          <IngredientCard item={item} />
        </Link>
      ))}
    </div>
  );
}
