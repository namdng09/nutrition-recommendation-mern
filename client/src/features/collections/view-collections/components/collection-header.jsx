import React from 'react';
import { FaFolderOpen, FaLayerGroup } from 'react-icons/fa';

import CollectionsEmpty from './collection-empty';

export default function CollectionsHeader({ totalDocs = 0, hasCollections }) {
  return (
    <>
      <div className='relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-500/[0.08] via-background to-background px-6 py-8 shadow-sm sm:px-8 sm:py-10'>
        <div className='absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl' />
        <div className='absolute -bottom-14 left-0 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl' />

        <div className='relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
          <div className='max-w-2xl space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg'>
                <FaFolderOpen size={18} />
              </div>

              <h1 className='text-3xl font-black tracking-tight text-foreground sm:text-4xl'>
                Bộ sưu tập <span className='text-sky-600'>món ăn</span>
              </h1>
            </div>

            <p className='max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-[15px]'>
              Lưu trữ và tổ chức những công thức yêu thích của cộng đồng theo
              cách trực quan, gọn gàng và dễ khám phá hơn.
            </p>
          </div>

          <div className='self-start md:self-end'>
            <span className='inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground shadow-sm backdrop-blur'>
              <FaLayerGroup size={12} className='text-sky-600' />
              {totalDocs} Bộ sưu tập
            </span>
          </div>
        </div>
      </div>

      {!hasCollections && <CollectionsEmpty />}
    </>
  );
}
