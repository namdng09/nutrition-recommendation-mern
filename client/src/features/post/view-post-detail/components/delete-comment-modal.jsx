import { useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
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

import { useDeletePostComment } from '../../delete-post-comment/api/delete-post-comment';

export default function DeleteCommentModal({ postId, commentId }) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeletePostComment({
      onSuccess: () => {
        setOpenDeleteDialog(false);
      }
    });

  const handleDelete = () => {
    deleteComment({ postId, commentId });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <FiMoreHorizontal
            size={16}
            className='cursor-pointer text-primary/40 transition-colors hover:text-primary'
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          sideOffset={8}
          className='w-44 rounded-xl border border-border bg-popover shadow-2xl'
        >
          <DropdownMenuItem
            className='cursor-pointer gap-3 text-destructive'
            onClick={() => setOpenDeleteDialog(true)}
          >
            <HiOutlineTrash size={18} />
            Xoá bình luận
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá bình luận</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá bình luận này không? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpenDeleteDialog(false)}
              disabled={isDeletingComment}
            >
              Huỷ
            </Button>

            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeletingComment}
            >
              {isDeletingComment ? 'Đang xoá...' : 'Xoá bình luận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
