import React from 'react';
import { FaFolderOpen, FaLayerGroup } from 'react-icons/fa';

import CollectionsEmpty from './collection-empty';

export default function CollectionsHeader({ totalDocs = 0, hasCollections }) {
  return (
    <>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 border-border pb-8'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-100'>
              <FaFolderOpen />
            </div>

            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
              Bộ sưu tập <span className='text-sky-600'>món ăn</span>
            </h1>
          </div>

          <p className='text-muted-foreground font-medium'>
            Lưu trữ và tổ chức những công thức yêu thích của cộng đồng
          </p>
        </div>

        <span className='inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground border border-border/50'>
          <FaLayerGroup size={12} />
          {totalDocs} Bộ sưu tập
        </span>
      </div>

      {!hasCollections && <CollectionsEmpty />}
    </>
  );
}
