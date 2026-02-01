import { useState } from 'react';
import {
  HiOutlineDuplicate,
  HiOutlinePencil,
  HiOutlinePlusCircle,
  HiOutlineTrash
} from 'react-icons/hi';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import DishModal from '~/features/dishes/view-dishes/components/dish-modal';

export default function AddFoodModal({
  children,
  mealType,
  scheduleId,
  scheduleMeals
}) {
  const [openDishModal, setOpenDishModal] = useState(false);

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
            className='gap-3'
            onClick={() => setOpenDishModal(true)}
          >
            <HiOutlinePencil size={18} />
            Thêm món ăn
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className='gap-3'>
            <HiOutlineDuplicate size={18} />
            Sao chép thực đơn
          </DropdownMenuItem>

          <DropdownMenuItem className='gap-3'>
            <HiOutlinePlusCircle size={18} />
            Thêm ngày mới
          </DropdownMenuItem>

          <DropdownMenuItem className='gap-3 text-destructive'>
            <HiOutlineTrash size={18} />
            Xoá toàn bộ ngày
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DishModal
        open={openDishModal}
        onClose={() => setOpenDishModal(false)}
        mealType={mealType}
        scheduleId={scheduleId}
        scheduleMeals={scheduleMeals}
      />
    </>
  );
}
