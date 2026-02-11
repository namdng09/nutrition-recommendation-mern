import { FaBan } from 'react-icons/fa';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useUnblockDish } from '../../unblock-dish/api/unblock-dish';
import { useBlockDish } from '../api/block-dish';

export default function BlockToggleDishButton({ dishId }) {
  const { data: profile } = useProfile();

  const { mutate: block } = useBlockDish();
  const { mutate: unblock } = useUnblockDish();

  const blocked = profile?.blockDishes?.includes(dishId);

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

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
      className={`rounded-full transition-all duration-300 active:scale-95 shadow-sm
    ${
      blocked
        ? 'bg-red-600 text-white border-red-700 hover:bg-red-700 shadow-red-200 animate-in fade-in zoom-in'
        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
    } border`}
    >
      <FaBan
        size={14}
        className={`transition-transform duration-500 ${
          blocked ? 'rotate-[360deg] scale-125' : 'rotate-0 scale-100'
        }`}
      />
    </Button>
  );
}
