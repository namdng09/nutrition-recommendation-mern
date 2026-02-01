import React from 'react';
import { FaLeaf } from 'react-icons/fa';

import { Input } from '~/components/ui/input';

export default function IngredientsToolbar({
  name,
  onNameChange,
  totalDocs,
  page,
  totalPages
}) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-start gap-3'>
        <span className='mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/15'>
          <FaLeaf className='h-4 w-4 text-emerald-600' />
        </span>

        <div>
          <h1 className='text-2xl font-bold text-foreground'>Nguyên liệu</h1>
          <p className='text-sm text-muted-foreground'>
            Tổng: {totalDocs} • Trang {page}/{totalPages}
          </p>
        </div>
      </div>

      <div className='flex w-full gap-2 sm:w-auto'>
        <Input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder='Tìm kiếm tên nguyên liệu...'
          className='w-full sm:w-72'
        />
      </div>
    </div>
  );
}
