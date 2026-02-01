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

export default function AddFoodModal({ children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='
          w-56
          rounded-xl
          bg-popover
          text-popover-foreground
          border border-border
          shadow-2xl
        '
      >
        <DropdownMenuItem className='gap-3'>
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

        <DropdownMenuItem className='gap-3 text-destructive focus:bg-destructive/10 focus:text-destructive'>
          <HiOutlineTrash size={18} />
          Xoá toàn bộ ngày
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
