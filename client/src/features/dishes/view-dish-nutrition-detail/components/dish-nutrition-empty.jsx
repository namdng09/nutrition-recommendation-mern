import React from 'react';

export default function DishNutritionEmpty({
  message = 'Đang tải dữ liệu dinh dưỡng...'
}) {
  return (
    <div className='flex h-96 flex-col items-center justify-center space-y-4'>
      <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />

      <p className='animate-pulse font-medium text-muted-foreground'>
        {message}
      </p>
    </div>
  );
}
