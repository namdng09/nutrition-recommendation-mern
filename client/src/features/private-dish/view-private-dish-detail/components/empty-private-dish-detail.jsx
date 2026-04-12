import React from 'react';

export default function EmptyPrivateDishDetail() {
  return (
    <div className='flex min-h-[45vh] items-center justify-center px-6'>
      <div className='rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium text-muted-foreground shadow-sm'>
        Đang tải món ăn...
      </div>
    </div>
  );
}
