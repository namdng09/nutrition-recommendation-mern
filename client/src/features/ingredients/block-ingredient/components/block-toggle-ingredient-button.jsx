import { FaBan } from 'react-icons/fa';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useUnblockIngredient } from '../../unblock-ingredient/api/unblock-ingredient';
import { useBlockIngredient } from '../api/block-ingredient';

export default function BlockToggleIngredientButton({ ingredientId }) {
  const { data: profile } = useProfile();

  const { mutate: block } = useBlockIngredient();
  const { mutate: unblock } = useUnblockIngredient();

  const blocked = profile?.blockIngredients?.includes(ingredientId);

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (blocked) {
      unblock(ingredientId);
    } else {
      block(ingredientId);
    }
  };

  return (
    <Button
      onClick={handleClick}
      size='icon'
      variant='ghost'
      className={`rounded-full transition-all duration-300
    ${
      blocked
        ? 'bg-rose-100 text-rose-700 border-2 border-rose-500 ring-4 ring-rose-200'
        : 'bg-slate-50 text-slate-400 border border-slate-200'
    }`}
    >
      <FaBan size={14} />
    </Button>
  );
}
