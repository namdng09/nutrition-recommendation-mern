import { useState } from 'react';
import {
  HiOutlineDocumentText,
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

import { useClearMealDishes } from '../../clear-dish/api/clear-dish';
import DishNoteModal from './dish-note-modal';

export default function AddFoodModal({
  children,
  mealType,
  scheduleId,
  scheduleMeals
}) {
  const [openDishModal, setOpenDishModal] = useState(false);
  const [openNoteModal, setOpenNoteModal] = useState(false);
  const { mutate: clearMealDishes } = useClearMealDishes();

  const handleClearMeal = () => {
    clearMealDishes({ scheduleId, mealType });
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
            className='gap-3'
            onClick={() => setOpenDishModal(true)}
          >
            <HiOutlinePencil size={18} />
            Thêm món ăn
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className='gap-3'
            onClick={() => setOpenNoteModal(true)}
          >
            <HiOutlineDocumentText size={18} />
            Thêm ghi chú món ăn
          </DropdownMenuItem>

          <DropdownMenuItem className='gap-3'>
            <HiOutlineDuplicate size={18} />
            Sao chép thực đơn
          </DropdownMenuItem>

          <DropdownMenuItem className='gap-3'>
            <HiOutlinePlusCircle size={18} />
            Thêm ngày mới
          </DropdownMenuItem>

          <DropdownMenuItem
            className='gap-3 text-destructive'
            onClick={handleClearMeal}
          >
            <HiOutlineTrash size={18} />
            Xoá toàn bộ món của bữa
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

      <DishNoteModal
        open={openNoteModal}
        onClose={() => setOpenNoteModal(false)}
        mealType={mealType}
        scheduleId={scheduleId}
        scheduleMeals={scheduleMeals}
      />
    </>
  );
}
