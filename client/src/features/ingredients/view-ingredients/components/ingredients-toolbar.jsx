import React, { useEffect, useState } from 'react';
import { FaLeaf } from 'react-icons/fa';

import { Input } from '~/components/ui/input';

export default function IngredientsToolbar({
  name,
  onNameChange,
  totalDocs,
  page,
  totalPages
}) {
  const [inputValue, setInputValue] = useState(name);

  useEffect(() => {
    if (inputValue === name) return;
    const timer = setTimeout(() => {
      onNameChange(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, name, onNameChange]);

  useEffect(() => {
    setInputValue(name);
  }, [name]);

  return (
    <div className='relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500/[0.08] via-background to-background p-5 shadow-sm ring-1 ring-border/60 sm:p-6'>
      <div className='absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl' />
      <div className='absolute -bottom-12 left-0 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl' />

      <div className='relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex items-start gap-4'>
          <span className='mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm ring-1 ring-emerald-500/15 dark:bg-emerald-500/10 dark:text-emerald-400'>
            <FaLeaf className='h-5 w-5' />
          </span>

          <div className='space-y-1.5'>
            <h1 className='text-2xl font-black tracking-tight text-foreground sm:text-3xl'>
              Nguyên liệu
            </h1>

            <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
              <span className='rounded-full bg-card px-3 py-1 font-semibold shadow-sm ring-1 ring-border/50'>
                Tổng: {totalDocs}
              </span>
              <span className='rounded-full bg-card px-3 py-1 font-semibold shadow-sm ring-1 ring-border/50'>
                Trang {page}/{totalPages}
              </span>
            </div>
          </div>
        </div>

        <div className='w-full lg:w-auto'>
          <div className='rounded-2xl bg-card/80 p-2 shadow-sm ring-1 ring-border/50 backdrop-blur'>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder='Tìm kiếm tên nguyên liệu...'
              className='w-full border-0 bg-transparent shadow-none focus-visible:ring-0 sm:w-80'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
