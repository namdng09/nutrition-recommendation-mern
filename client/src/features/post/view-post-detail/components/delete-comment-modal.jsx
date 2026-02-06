import { FiMoreHorizontal } from 'react-icons/fi';
import { HiOutlineTrash } from 'react-icons/hi';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

import { useDeletePostComment } from '../../delete-post-comment/api/delete-post-comment';

export default function DeleteCommentModal({ postId, commentId }) {
  const { mutate: deleteComment } = useDeletePostComment();

  const handleDelete = () => {
    deleteComment({ postId, commentId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FiMoreHorizontal
          size={16}
          className='text-primary/40 hover:text-primary transition-colors cursor-pointer'
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='w-44 rounded-xl bg-popover border border-border shadow-2xl'
      >
        <DropdownMenuItem
          className='gap-3 text-destructive cursor-pointer'
          onClick={handleDelete}
        >
          <HiOutlineTrash size={18} />
          Xoá bình luận
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
