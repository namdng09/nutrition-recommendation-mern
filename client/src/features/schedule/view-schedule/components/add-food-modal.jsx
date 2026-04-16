import { useState } from 'react';
import {
  HiOutlineDocumentText,
  HiOutlinePencil,
  HiOutlineTrash
} from 'react-icons/hi';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import DishModal from '~/features/dishes/view-dishes/components/dish-modal';

import { useClearMealDishes } from '../../clear-dish/api/clear-dish';
import { useDeleteScheduleMeal } from '../../delete-meal/api/delete-meal';
import DishNoteModal from './dish-note-modal';

export default function AddFoodModal({
  children,
  mealType,
  scheduleId,
  scheduleMeals
}) {
  const [openDishModal, setOpenDishModal] = useState(false);
  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [openDeleteMealDialog, setOpenDeleteMealDialog] = useState(false);
  const { mutate: clearMealDishes } = useClearMealDishes();
  const { mutate: deleteScheduleMeal, isPending: isDeletingMeal } =
    useDeleteScheduleMeal({
      onSuccess: () => {
        setOpenDeleteMealDialog(false);
      }
    });

  const handleClearMeal = () => {
    clearMealDishes({ scheduleId, mealType });
  };

  const handleDeleteMeal = () => {
    deleteScheduleMeal({ scheduleId, mealType });
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

          <DropdownMenuItem
            className='gap-3 text-destructive'
            onClick={handleClearMeal}
          >
            <HiOutlineTrash size={18} />
            Xoá toàn bộ món của bữa
          </DropdownMenuItem>

          <DropdownMenuItem
            className='gap-3 text-destructive'
            onClick={() => setOpenDeleteMealDialog(true)}
          >
            <HiOutlineTrash size={18} />
            Xoá bữa ăn
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

      <Dialog
        open={openDeleteMealDialog}
        onOpenChange={setOpenDeleteMealDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá bữa ăn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá bữa ăn này không? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpenDeleteMealDialog(false)}
              disabled={isDeletingMeal}
            >
              Huỷ
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteMeal}
              disabled={isDeletingMeal}
            >
              {isDeletingMeal ? 'Đang xoá...' : 'Xoá bữa ăn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
