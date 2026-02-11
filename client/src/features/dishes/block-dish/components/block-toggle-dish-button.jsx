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
      className={`rounded-full transition-all duration-300 active:scale-90 shadow-sm
        ${
          blocked
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
        }`}
    >
      <FaBan
        size={14}
        className={`transition-transform ${
          blocked ? 'scale-110' : 'scale-100'
        }`}
      />
    </Button>
  );
}
