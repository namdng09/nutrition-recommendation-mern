import React from 'react';
import { IoClose } from 'react-icons/io5';

import { useDeleteGroceryIngredient } from '../../delete-grocery-ingredient/api/delete-grocery-ingredient';

const DeleteIngredientButton = ({ groceryId, ingredientId }) => {
  const { mutate } = useDeleteGroceryIngredient();

  const handleDelete = e => {
    e.stopPropagation();

    mutate({
      groceryId,
      ingredientId
    });
  };

  return (
    <button
      onClick={handleDelete}
      className='
    text-muted-foreground
    hover:text-red-500
    transition
  '
    >
      <IoClose size={20} />
    </button>
  );
};

export default DeleteIngredientButton;
