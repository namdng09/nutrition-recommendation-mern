import { useState } from 'react';
import { HiOutlineTrash } from 'react-icons/hi';

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
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

import { useDeleteDishSchedule } from '../../delete-dish-schedule/api/delete-dish-schedule';

export default function DeleteDishModal({
  children,
  scheduleId,
  mealType,
  dishId
}) {
  const [openDeleteDishDialog, setOpenDeleteDishDialog] = useState(false);

  const { mutate: deleteDish, isPending: isDeletingDish } =
    useDeleteDishSchedule({
      onSuccess: () => {
        setOpenDeleteDishDialog(false);
      }
    });

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
          className='w-56 rounded-xl border border-border bg-popover shadow-2xl'
        >
          <DropdownMenuItem
            className='gap-3 text-destructive'
            onClick={() => setOpenDeleteDishDialog(true)}
          >
            <HiOutlineTrash size={18} />
            Xoá món này
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={openDeleteDishDialog}
        onOpenChange={setOpenDeleteDishDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá món ăn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá món ăn này khỏi bữa ăn không? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpenDeleteDishDialog(false)}
              disabled={isDeletingDish}
            >
              Huỷ
            </Button>

            <Button
              variant='destructive'
              onClick={handleDeleteDish}
              disabled={isDeletingDish}
            >
              {isDeletingDish ? 'Đang xoá...' : 'Xoá món này'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
