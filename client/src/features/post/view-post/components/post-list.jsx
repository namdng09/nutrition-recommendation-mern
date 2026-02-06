import { useState } from 'react';
import { FaRegCalendarAlt, FaTag, FaUserCircle } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { Link } from 'react-router';

import { usePost } from '../api/view-post';
import PostPagination from './post-pagination';

export default function PostList() {
  const [page, setPage] = useState(1);
  const data = usePost({ page });
  const { docs: posts, totalPages, hasPrevPage, hasNextPage } = data.data;

  return (
    <div className='mx-auto max-w-7xl space-y-12 bg-background text-foreground'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6 mb-8'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <HiSparkles className='text-primary animate-pulse' size={24} />
            <span className='text-xs font-bold uppercase tracking-[0.2em] text-primary/60'>
              Tin tức hàng ngày
            </span>
          </div>
          <h2 className='text-3xl font-black tracking-tight sm:text-4xl uppercase flex items-center gap-3'>
            Bài viết <span className='text-primary'>mới nhất</span>
          </h2>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {posts.map(post => (
          <Link
            key={post._id}
            to={`/posts/${post._id}`}
            className='group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:shadow-[0_20px_40px_color-mix(in_srbg,var(--foreground)_8%,transparent)]'
          >
            <div className='relative h-64 w-full overflow-hidden'>
              <img
                src={post.images?.[0]}
                alt={post.title}
                className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
              />
              {post.category && (
                <div className='absolute top-4 left-4'>
                  <span className='flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg'>
                    <FaTag size={10} />
                    {post.category}
                  </span>
                </div>
              )}
            </div>

            <div className='flex flex-1 flex-col p-6'>
              {post.title && (
                <h3 className='mb-3 line-clamp-2 text-xl font-extrabold group-hover:text-primary transition-colors'>
                  {post.title}
                </h3>
              )}

              {post.content && (
                <p className='mb-6 line-clamp-2 text-sm text-muted-foreground font-medium'>
                  {post.content}
                </p>
              )}

              <div className='mt-auto flex items-center justify-between border-t border-border pt-5'>
                <div className='flex items-center gap-2'>
                  <FaUserCircle size={24} className='text-muted-foreground' />
                  {post.author?.name && (
                    <span className='text-sm font-bold'>
                      {post.author.name}
                    </span>
                  )}
                </div>

                {post.createdAt && (
                  <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground'>
                    <FaRegCalendarAlt className='text-primary' />
                    <span>
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <PostPagination
        page={page}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
      />
    </div>
  );
}
