import { HiOutlineTrash } from 'react-icons/hi';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

import { useDeleteSchedule } from '../api/delete-schedule';

export default function DeleteScheduleModal({ children, scheduleId }) {
  const { mutate: deleteSchedule } = useDeleteSchedule();

  const handleDeleteSchedule = () => {
    deleteSchedule(scheduleId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='w-56 rounded-xl bg-popover border border-border shadow-2xl'
      >
        <DropdownMenuItem
          className='gap-3 text-destructive'
          onClick={handleDeleteSchedule}
        >
          <HiOutlineTrash size={18} />
          Xoá lịch ăn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
