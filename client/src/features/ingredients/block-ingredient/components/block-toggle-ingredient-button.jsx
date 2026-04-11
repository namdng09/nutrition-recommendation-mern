import { FaBan } from 'react-icons/fa';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useUnblockIngredient } from '../../unblock-ingredient/api/unblock-ingredient';
import { useBlockIngredient } from '../api/block-ingredient';

export default function BlockToggleIngredientButton({ ingredientId }) {
  const { data: profile } = useProfile();

  const { mutate: block, isPending: isBlocking } = useBlockIngredient();
  const { mutate: unblock, isPending: isUnblocking } = useUnblockIngredient();

  const blockedIngredients = profile?.blockIngredients || [];
  const blockedIngredientIds = blockedIngredients.map(item =>
    typeof item === 'string' ? item : item?._id
  );

  const blocked = blockedIngredientIds.includes(ingredientId);
  const isLoading = isBlocking || isUnblocking;

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

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
      disabled={isLoading}
      className={`rounded-full transition-all duration-300 ${
        blocked
          ? 'border-2 border-rose-500 bg-rose-100 text-rose-700 ring-4 ring-rose-200'
          : 'border border-slate-200 bg-slate-50 text-slate-400'
      }`}
    >
      <FaBan size={14} />
    </Button>
  );
}
