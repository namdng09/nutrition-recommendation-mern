import React from 'react';

import { Button } from '~/components/ui/button';

export default function PostPagination({
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
        Trước
      </Button>

      <div className='text-sm text-muted-foreground'>
        Trang <span className='font-semibold text-foreground'>{page}</span> /{' '}
        <span className='font-semibold text-foreground'>{totalPages}</span>
      </div>

      <Button variant='outline' onClick={onNext} disabled={!hasNextPage}>
        Sau
      </Button>
    </div>
  );
}
