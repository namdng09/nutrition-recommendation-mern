import React, { useState } from 'react';
import { FaFireAlt, FaLock, FaLockOpen, FaTag, FaUser } from 'react-icons/fa';
import { Link } from 'react-router';

import { useCollections } from '../api/view-collection';
import CollectionPagination from './collection-pagination';

export default function CollectionsList() {
  const [page, setPage] = useState(1);
  const { data } = useCollections({
    page,
    limit: 6
  });
  const collections = data?.docs ?? [];

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8'>
      <div className='flex items-end justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Bộ sưu tập món ăn
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Khám phá các bộ sưu tập món ăn
          </p>
        </div>

        <span className='rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground'>
          {data?.totalDocs ?? 0} bộ sưu tập
        </span>
      </div>

      {!collections.length && (
        <div className='rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-muted-foreground'>
          Chưa có bộ sưu tập nào
        </div>
      )}

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {collections.map(col => (
          <div
            key={col._id}
            className='group relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg'
          >
            <Link to={`/collections/${col._id}`}>
              <div className='p-5 space-y-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <h3 className='truncate text-lg font-semibold'>
                      {col.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      col.isPublic
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {col.isPublic ? <FaLockOpen /> : <FaLock />}
                    {col.isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>

                <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                  <span className='inline-flex items-center gap-1'>
                    <FaUser className='h-3.5 w-3.5' />
                    {col.user?.name}
                  </span>

                  <span className='inline-flex items-center gap-1'>
                    <FaFireAlt className='h-3.5 w-3.5 text-orange-500' />
                    {col.dishes?.length ?? 0} món
                  </span>
                </div>

                {col.tags?.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {col.tags.map(tag => (
                      <span
                        key={tag}
                        className='inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200'
                      >
                        <FaTag className='h-3 w-3' />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {col.dishes?.[0] && (
                  <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3'>
                    <img
                      src={col.dishes[0].image}
                      alt={col.dishes[0].name}
                      className='h-12 w-12 rounded-lg object-cover'
                    />
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium'>
                        {col.dishes[0].name}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {col.dishes[0].calories} kcal
                      </div>
                    </div>
                  </div>
                )}

                <Link
                  to={`/collections/${col._id}`}
                  className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'
                >
                  Xem chi tiết →
                </Link>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <CollectionPagination
        page={data?.page}
        totalPages={data?.totalPages}
        hasPrevPage={data?.hasPrevPage}
        hasNextPage={data?.hasNextPage}
        onPrev={() => setPage(p => Math.max(1, p - 1))}
        onNext={() => setPage(p => p + 1)}
      />
    </div>
  );
}
