import { HiOutlineTrash } from 'react-icons/hi';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

import { useDeleteDishSchedule } from '../../delete-dish-schedule/api/delete-dish-schedule';

export default function DeleteDishModal({
  children,
  scheduleId,
  mealType,
  dishId
}) {
  const { mutate: deleteDish } = useDeleteDishSchedule();
  const handleDeleteDish = () => {
    deleteDish({ scheduleId, mealType, dishId });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          sideOffset={8}
          className='w-56 rounded-xl bg-popover border border-border shadow-2xl'
        >
          <DropdownMenuItem
            className='gap-3 text-destructive'
            onClick={handleDeleteDish}
          >
            <HiOutlineTrash size={18} />
            Xoá món này
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
