import { FaBan } from 'react-icons/fa';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useUnblockDish } from '../../unblock-dish/api/unblock-dish';
import { useBlockDish } from '../api/block-dish';

export default function BlockToggleDishButton({ dishId }) {
  const { data: profile } = useProfile();

  const { mutate: block, isPending: isBlocking } = useBlockDish();
  const { mutate: unblock, isPending: isUnblocking } = useUnblockDish();

  const blockedDishes = profile?.blockDishes || [];
  const blockedDishIds = blockedDishes.map(item =>
    typeof item === 'string' ? item : item?._id
  );

  const blocked = blockedDishIds.includes(dishId);
  const isLoading = isBlocking || isUnblocking;

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    if (blocked) {
      unblock(dishId);
    } else {
      block(dishId);
    }
  };

  return (
    <Button
      onClick={handleClick}
      size='icon'
      variant='ghost'
      disabled={isLoading}
      className={`rounded-full border shadow-sm transition-all duration-300 active:scale-95 ${
        blocked
          ? 'animate-in zoom-in fade-in border-red-700 bg-red-600 text-white shadow-red-200 hover:bg-red-700'
          : 'border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
    >
      <FaBan
        size={14}
        className={`transition-transform duration-500 ${
          blocked ? 'scale-125 rotate-[360deg]' : 'scale-100 rotate-0'
        }`}
      />
    </Button>
  );
}
