import React from 'react';
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill
} from 'react-icons/ri';

import { useUpdateGroceryIngredient } from '../../update-grocery-ingredient/api/update-grocery-ingredient';
import DeleteIngredientButton from './delete-ingredient-button';

export default function GroceryIngredientsList({
  ingredients = [],
  groceryId
}) {
  const { mutate } = useUpdateGroceryIngredient();

  if (!ingredients.length) {
    return (
      <div className='text-center text-sm text-muted-foreground italic py-6'>
        Chưa có nguyên liệu
      </div>
    );
  }

  const sortedIngredients = [...ingredients].sort(
    (a, b) => Number(a.isPurchased) - Number(b.isPurchased)
  );

  const togglePurchased = item => {
    mutate({
      groceryId,
      ingredientId: item.ingredientId,
      isPurchased: !item.isPurchased
    });
  };

  return sortedIngredients.map(item => (
    <div
      key={item?._id}
      className={`group/item flex items-center justify-between px-2 py-4 border-b border-border/40 last:border-0 ${
        item?.isPurchased ? 'opacity-40 grayscale' : ''
      }`}
    >
      <div className='flex items-center gap-5'>
        <button
          onClick={() => togglePurchased(item)}
          className='transition active:scale-90'
        >
          {item?.isPurchased ? (
            <RiCheckboxCircleFill className='h-7 w-7 text-primary' />
          ) : (
            <RiCheckboxBlankCircleLine className='h-7 w-7 text-muted-foreground/40 hover:text-primary' />
          )}
        </button>

        <div>
          {item?.name && (
            <div
              className={`text-lg font-bold font-mono uppercase ${
                item?.isPurchased && 'line-through'
              }`}
            >
              {item.name}
            </div>
          )}
        </div>
      </div>

      <div className='flex items-center gap-4'>
        {item?.quantity && (
          <div className='font-mono font-extrabold text-lg text-primary'>
            {item.quantity.toLocaleString()}G
          </div>
        )}

        <DeleteIngredientButton
          groceryId={groceryId}
          ingredientId={item.ingredientId}
        />
      </div>
    </div>
  ));
}
