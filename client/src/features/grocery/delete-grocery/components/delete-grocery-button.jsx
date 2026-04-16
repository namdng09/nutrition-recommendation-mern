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

import { useDeleteGrocery } from '../api/delete-grocery';

export default function DeleteGroceryButton({ groceryId }) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { mutate, isPending } = useDeleteGrocery({
    onSuccess: () => {
      setOpenDeleteDialog(false);
    }
  });

  const handleDelete = () => {
    if (!groceryId) return;
    mutate({ groceryId });
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setOpenDeleteDialog(true)}
        className='absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 shadow-sm transition-all duration-200 active:scale-95'
      >
        <HiOutlineTrash size={18} />
      </button>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá danh sách mua sắm</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá danh sách mua sắm này không? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpenDeleteDialog(false)}
              disabled={isPending}
            >
              Huỷ
            </Button>

            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Đang xoá...' : 'Xoá danh sách'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
