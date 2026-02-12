import { useState } from 'react';
import { HiOutlineDocumentText, HiOutlineDotsVertical } from 'react-icons/hi';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

import GroceryNoteModal from './grocery-note-modal';

export default function NoteActionsMenu({ grocery }) {
  const [openNote, setOpenNote] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='p-1.5 rounded-lg hover:bg-muted transition'>
            <HiOutlineDotsVertical size={16} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='w-44 rounded-xl font-sans normal-case tracking-normal'
        >
          <DropdownMenuItem
            className='gap-3 text-sm font-medium'
            onClick={() => setOpenNote(true)}
          >
            <HiOutlineDocumentText size={18} />
            Ghi chú danh sách
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GroceryNoteModal
        open={openNote}
        onClose={() => setOpenNote(false)}
        grocery={grocery}
      />
    </>
  );
}
