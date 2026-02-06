import React, { useState } from 'react';
import {
  FaChevronRight,
  FaFireAlt,
  FaFolderOpen,
  FaLock,
  FaLockOpen,
  FaTag,
  FaUser
} from 'react-icons/fa';
import { Link } from 'react-router';

import StatBadge from '~/features/dishes/view-dishes/components/dish-stat-badge';

import { useCollections } from '../api/view-collection';
import CollectionPagination from './collection-pagination';

export default function CollectionsList() {
  const [page, setPage] = useState(1);
  const { data } = useCollections();
  const collections = data?.docs ?? [];

  return (
    <div className='mx-auto w-full max-w-7xl space-y-3 animate-in fade-in duration-700'>
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
          {data?.totalDocs ?? 0} Bộ sưu tập
        </span>
      </div>

      {!collections.length && (
        <div className='rounded-[2.5rem] border-2 border-dashed border-border bg-muted/20 p-20 text-center'>
          <p className='text-muted-foreground font-medium'>
            Chưa có bộ sưu tập nào được tạo.
          </p>
        </div>
      )}

      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {collections.map(col => (
          <div
            key={col._id}
            className='group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-background transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-900/5'
          >
            <Link
              to={`/collections/${col._id}`}
              className='flex flex-1 flex-col p-6'
            >
              <div className='flex items-start justify-between gap-4 mb-3'>
                <h3 className='text-xl font-bold text-foreground transition-colors group-hover:text-sky-600 line-clamp-1'>
                  {col.name}
                </h3>
                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter ${
                    col.isPublic
                      ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                      : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                  }`}
                >
                  {col.isPublic ? <FaLockOpen size={9} /> : <FaLock size={9} />}
                  {col.isPublic ? 'Công Khai' : 'Riêng Tư'}
                </span>
              </div>

              <div className='flex flex-wrap gap-2 mb-6'>
                <StatBadge
                  icon={<FaUser size={10} />}
                  value={col.user?.name}
                  theme='gray'
                />
                <StatBadge
                  icon={<FaFireAlt size={10} />}
                  value={`${col.dishes?.length ?? 0} món`}
                  theme='orange'
                />
              </div>

              {col.dishes?.[0] ? (
                <div className='mb-6 relative overflow-hidden rounded-2xl border border-border/60 bg-secondary/20 p-3 transition-colors group-hover:bg-sky-50/50 group-hover:border-sky-100'>
                  <div className='flex items-center gap-4'>
                    <img
                      src={col.dishes[0].image}
                      alt={col.dishes[0].name}
                      className='h-14 w-14 rounded-xl object-cover shadow-sm transition-transform duration-700 group-hover:scale-105'
                    />
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-bold text-foreground'>
                        {col.dishes[0].name}
                      </div>
                      <div className='text-[11px] font-medium text-muted-foreground'>
                        Món ăn tiêu biểu • {col.dishes[0].calories} kcal
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='mb-6 h-[80px] flex items-center justify-center rounded-2xl border border-dashed border-border text-[11px] text-muted-foreground font-medium uppercase tracking-widest'>
                  Trống
                </div>
              )}

              {col.tags?.length > 0 && (
                <div className='flex flex-wrap gap-1.5 mb-4'>
                  {col.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className='text-[14px] font-bold text-sky-600/70'
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className='mt-auto flex items-center justify-between border-t border-border/50 pt-2'>
                <span className='text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground group-hover:text-sky-600 transition-colors'>
                  Khám phá ngay
                </span>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all group-hover:bg-sky-600 group-hover:text-white group-hover:translate-x-1'>
                  <FaChevronRight size={12} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div>
        <CollectionPagination
          page={data?.page}
          totalPages={data?.totalPages}
          hasPrevPage={data?.hasPrevPage}
          hasNextPage={data?.hasNextPage}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => p + 1)}
        />
      </div>
    </div>
  );
}
