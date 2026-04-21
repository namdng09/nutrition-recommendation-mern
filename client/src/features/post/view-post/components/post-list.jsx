import { useState } from 'react';
import { FaRegCalendarAlt, FaTag, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router';

import { usePost } from '../api/view-post';
import PostFilter from './post-filter';
import PostListHeader from './post-list-header';
import PostPagination from './post-pagination';

const PAGE_SIZE = 6;

export default function PostList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    title: '',
    category: ''
  });

  const data = usePost({
    ...filters,
    page,
    limit: PAGE_SIZE
  });

  const {
    docs: posts = [],
    totalPages = 1,
    hasPrevPage = false,
    hasNextPage = false
  } = data.data || {};

  const handleSearch = nextFilters => {
    setPage(1);
    setFilters(nextFilters);
  };

  const handleReset = () => {
    setPage(1);
    setFilters({
      title: '',
      category: ''
    });
  };

  return (
    <div className='mx-auto max-w-7xl space-y-10 bg-background text-foreground'>
      <PostListHeader />
      <PostFilter
        filters={filters}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
        {posts.map(post => (
          <Link
            key={post._id}
            to={`/posts/${post._id}`}
            className='group flex h-full flex-col overflow-hidden rounded-[28px] bg-card shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/50 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]'
          >
            <div className='relative h-60 w-full overflow-hidden sm:h-64'>
              <img
                src={post.images?.[0] || '/logo2.png'}
                alt={post.title}
                className='h-full w-full object-cover transition-transform'
              />

              <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent' />

              {post.category && (
                <div className='absolute left-4 top-4'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary shadow-md backdrop-blur'>
                    <FaTag size={10} />
                    {post.category}
                  </span>
                </div>
              )}
            </div>

            <div className='flex flex-1 flex-col p-5 sm:p-6'>
              {post.title && (
                <h3 className='mb-3 line-clamp-2 text-[22px] font-black leading-tight tracking-tight transition-colors group-hover:text-primary'>
                  {post.title}
                </h3>
              )}

              {post.content && (
                <p className='mb-6 line-clamp-3 text-sm font-medium leading-6 text-muted-foreground'>
                  {post.content}
                </p>
              )}

              <div className='mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-5'>
                <div className='flex min-w-0 items-center gap-2.5'>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                    <FaUserCircle size={20} />
                  </div>

                  {post.author?.name && (
                    <span className='truncate text-sm font-bold text-foreground'>
                      {post.author.name}
                    </span>
                  )}
                </div>

                {post.createdAt && (
                  <div className='shrink-0 rounded-full bg-muted/70 px-3 py-1.5 text-[11px] font-bold text-muted-foreground'>
                    <span className='flex items-center gap-1.5'>
                      <FaRegCalendarAlt className='text-primary' />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!posts.length && (
        <div className='rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center'>
          <p className='text-lg font-bold text-foreground'>
            Không tìm thấy bài viết phù hợp
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Hãy thử đổi từ khóa hoặc bỏ bộ lọc danh mục.
          </p>
        </div>
      )}

      <PostPagination
        page={page}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onPrev={() => setPage(p => Math.max(1, p - 1))}
        onNext={() => setPage(p => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
