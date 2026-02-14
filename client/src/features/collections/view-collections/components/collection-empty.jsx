import React from 'react';

export default function CollectionsEmpty() {
  return (
    <div className='rounded-[2.5rem] border-2 border-dashed border-border bg-muted/20 p-20 text-center'>
      <p className='text-muted-foreground font-medium'>
        Chưa có bộ sưu tập nào được tạo.
      </p>
    </div>
  );
}
