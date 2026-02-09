import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

import { Button } from '~/components/ui/button';

const GroceryPagination = ({
  page,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPrev,
  onNext
}) => {
  return (
    <div
      className='
      flex flex-col sm:flex-row
      items-center justify-between
      gap-3
      border-t border-border
      pt-6
    '
    >
      <Button
        variant='outline'
        onClick={onPrev}
        disabled={!hasPrevPage}
        className='flex items-center gap-2'
      >
        <HiChevronLeft />
        Trang trước
      </Button>

      <div className='text-sm text-muted-foreground font-medium'>
        Trang <span className='font-bold text-foreground'>{page}</span>
        {' / '}
        <span className='font-bold text-foreground'>{totalPages}</span>
      </div>

      <Button
        variant='outline'
        onClick={onNext}
        disabled={!hasNextPage}
        className='flex items-center gap-2'
      >
        Trang sau
        <HiChevronRight />
      </Button>
    </div>
  );
};

export default GroceryPagination;
