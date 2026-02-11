import { HiOutlineTrash } from 'react-icons/hi';

import { useDeleteGrocery } from '../api/delete-grocery';

export default function DeleteGroceryButton({ groceryId }) {
  const { mutate } = useDeleteGrocery();

  const handleDelete = () => {
    if (!groceryId) return;

    mutate({ groceryId });
  };

  return (
    <button
      onClick={handleDelete}
      className='
    absolute -right-2 -top-2
    flex h-9 w-9 items-center justify-center
    rounded-xl bg-red-50 border border-red-200
    text-red-500
    shadow-sm
    transition-all duration-200
    active:scale-95
  '
    >
      <HiOutlineTrash size={18} />
    </button>
  );
}
