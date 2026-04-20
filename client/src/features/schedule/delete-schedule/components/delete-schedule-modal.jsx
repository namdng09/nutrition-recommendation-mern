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

import { useDeleteSchedule } from '../api/delete-schedule';

export default function DeleteScheduleModal({ children, scheduleId }) {
  const [openDeleteScheduleDialog, setOpenDeleteScheduleDialog] =
    useState(false);

  const { mutate: deleteSchedule, isPending: isDeletingSchedule } =
    useDeleteSchedule({
      onSuccess: () => {
        setOpenDeleteScheduleDialog(false);
      }
    });

  const handleDeleteSchedule = () => {
    deleteSchedule(scheduleId);
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
            onClick={() => setOpenDeleteScheduleDialog(true)}
          >
            <HiOutlineTrash size={18} />
            Xoá lịch ăn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={openDeleteScheduleDialog}
        onOpenChange={setOpenDeleteScheduleDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá lịch ăn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá lịch ăn này không? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpenDeleteScheduleDialog(false)}
              disabled={isDeletingSchedule}
            >
              Huỷ
            </Button>

            <Button
              variant='destructive'
              onClick={handleDeleteSchedule}
              disabled={isDeletingSchedule}
            >
              {isDeletingSchedule ? 'Đang xoá...' : 'Xoá lịch ăn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
