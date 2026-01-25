import React from 'react';

import { Button } from '~/components/ui/button';

export default function IngredientsPagination({
  page,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPrev,
  onNext
}) {
  return (
    <div className='flex items-center justify-between'>
      <Button variant='outline' onClick={onPrev} disabled={!hasPrevPage}>
        Prev
      </Button>

      <div className='text-sm text-muted-foreground'>
        Page <span className='font-semibold text-foreground'>{page}</span> of{' '}
        <span className='font-semibold text-foreground'>{totalPages}</span>
      </div>

      <Button variant='outline' onClick={onNext} disabled={!hasNextPage}>
        Next
      </Button>
    </div>
  );
}
