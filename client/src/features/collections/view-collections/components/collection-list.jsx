import React, { useMemo } from 'react';
import {
  FaChevronRight,
  FaFireAlt,
  FaLock,
  FaLockOpen,
  FaUser
} from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router';

import StatBadge from '~/features/dishes/view-dishes/components/dish-stat-badge';

import CollectionFavoriteButton from '../../add-collection-to-favorite/components/collection-favorite-button';
import { useCollections } from '../api/view-collection';
import CollectionFilter from './collection-filter';
import CollectionsHeader from './collection-header';
import CollectionPagination from './collection-pagination';

export default function CollectionsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get('name') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const params = useMemo(() => {
    const nextParams = { page, limit: 9 };

    if (name) nextParams.name = name;

    return nextParams;
  }, [name, page]);

  const { data } = useCollections(params);
  const collections = data?.docs ?? [];

  const goToPrev = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(Math.max(1, page - 1)));
      return next;
    });
  };

  const goToNext = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page + 1));
      return next;
    });
  };

  return (
    <div className='mx-auto w-full max-w-7xl animate-in space-y-6 fade-in duration-700'>
      <CollectionsHeader
        totalDocs={collections.length}
        hasCollections={collections.length > 0}
      />

      <CollectionFilter />

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
        {collections.map(col => {
          const cover = col.image || col.dishes?.[0]?.image || '/logo2.png';

          return (
            <div
              key={col._id}
              className='group relative flex flex-col overflow-hidden rounded-[28px] bg-card shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/50 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(14,116,144,0.12)]'
            >
              <Link
                to={`/collections/${col._id}`}
                className='flex flex-1 flex-col'
              >
                <div className='relative h-56 w-full overflow-hidden bg-muted'>
                  <img
                    src={cover}
                    alt={col.name}
                    loading='lazy'
                    className='h-full w-full object-cover'
                  />

                  <div className='absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent' />

                  <div className='absolute left-4 right-4 top-4 flex items-start justify-between gap-3'>
                    <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg'>
                      <FaLockOpen size={9} />
                      Công khai
                    </span>
                  </div>
                </div>

                <div className='flex flex-1 flex-col p-5 sm:p-6'>
                  <div className='flex items-start justify-between gap-3'>
                    <h3 className='line-clamp-2 text-[22px] font-black leading-tight tracking-tight text-foreground transition-colors group-hover:text-sky-600'>
                      {col.name}
                    </h3>

                    <div className='shrink-0'>
                      <CollectionFavoriteButton collectionId={col._id} />
                    </div>
                  </div>

                  <div className='mt-4 flex flex-wrap gap-2'>
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
                    <div className='mt-5 flex items-center gap-4 rounded-[20px] bg-muted/40 p-3.5 transition-all group-hover:bg-muted/60'>
                      <img
                        src={col.dishes[0].image || '/logo2.png'}
                        alt={col.dishes[0].name}
                        className='h-14 w-14 rounded-xl object-cover shadow-sm'
                      />

                      <div className='min-w-0'>
                        <div className='truncate text-sm font-bold text-foreground'>
                          {col.dishes[0].name}
                        </div>

                        <div className='mt-1 text-[11px] font-medium text-muted-foreground'>
                          Món tiêu biểu • {col.dishes[0].energy} kcal
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {col.tags?.length > 0 && (
                    <div className='mt-4 flex flex-wrap gap-2'>
                      {col.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className='rounded-full bg-sky-50 px-3 py-1 text-[12px] font-bold text-sky-700'
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className='mt-6 flex items-center justify-between border-t border-border/60 pt-4'>
                    <span className='text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-sky-600'>
                      Khám phá ngay
                    </span>

                    <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:bg-sky-600 group-hover:text-white'>
                      <FaChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <CollectionPagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        hasPrevPage={data?.hasPrevPage}
        hasNextPage={data?.hasNextPage}
        onPrev={goToPrev}
        onNext={goToNext}
      />
    </div>
  );
}
