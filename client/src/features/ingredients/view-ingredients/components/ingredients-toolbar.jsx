import React from 'react';

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
      <div>
        <h1 className='text-2xl font-bold text-foreground'>Ingredients</h1>
        <p className='text-sm text-muted-foreground'>
          Total: {totalDocs} • Page {page}/{totalPages}
        </p>
      </div>

      <div className='flex w-full gap-2 sm:w-auto'>
        <Input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder='Search by name...'
          className='w-full sm:w-72'
        />
      </div>
    </div>
  );
}
