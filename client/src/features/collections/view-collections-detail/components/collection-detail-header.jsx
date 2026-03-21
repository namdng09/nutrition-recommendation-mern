import React from 'react';
import {
  FaArrowLeft,
  FaFireAlt,
  FaLock,
  FaLockOpen,
  FaTag,
  FaUser
} from 'react-icons/fa';
import { Link } from 'react-router';

import StatBadge from '~/features/dishes/view-dishes/components/dish-stat-badge';

import CollectionFavoriteButton from '../../add-collection-to-favorite/components/collection-favorite-button';

export default function CollectionDetailHeader({ collection }) {
  return (
    <>
      <Link
        to='/collections'
        className='group inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm font-bold tracking-[0.14em] text-muted-foreground transition-all hover:bg-sky-50 hover:text-sky-600'
      >
        <FaArrowLeft className='transition-transform duration-300 group-hover:-translate-x-1' />
        QUAY LẠI BỘ SƯU TẬP
      </Link>

      <div className='relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-500/[0.08] via-background to-background p-7 shadow-[0_12px_40px_rgba(0,0,0,0.05)] ring-1 ring-border/50 md:p-10'>
        <div className='absolute -right-14 -top-14 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl' />
        <div className='absolute -bottom-16 left-0 h-36 w-36 rounded-full bg-sky-400/10 blur-3xl' />

        <div className='relative flex flex-wrap items-start justify-between gap-8'>
          <div className='max-w-3xl space-y-6'>
            <div className='space-y-3'>
              <h1 className='text-4xl font-black tracking-tight text-foreground md:text-5xl'>
                {collection.name}
              </h1>

              {collection.description && (
                <p className='text-base italic leading-relaxed text-muted-foreground/90 md:text-lg'>
                  "{collection.description}"
                </p>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <StatBadge
                icon={<FaUser size={12} />}
                value={collection.user?.name}
                theme='gray'
              />
              <StatBadge
                icon={<FaFireAlt size={12} />}
                value={`${collection.dishes.length} món ăn`}
                theme='orange'
              />
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-sm ${
                collection.isPublic
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-zinc-800 text-zinc-100 shadow-zinc-200'
              }`}
            >
              {collection.isPublic ? <FaLockOpen /> : <FaLock />}
              {collection.isPublic ? 'Công Khai' : 'Riêng Tư'}
            </span>

            <CollectionFavoriteButton collectionId={collection._id} />
          </div>
        </div>

        {collection.tags?.length > 0 && (
          <div className='mt-8 flex flex-wrap gap-2'>
            {collection.tags.map(tag => (
              <span
                key={tag}
                className='inline-flex items-center gap-1.5 rounded-full bg-background px-3.5 py-1.5 text-[11px] font-bold text-sky-700 shadow-sm ring-1 ring-sky-100 transition-all hover:bg-sky-50'
              >
                <FaTag className='h-3 w-3 opacity-60' />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
