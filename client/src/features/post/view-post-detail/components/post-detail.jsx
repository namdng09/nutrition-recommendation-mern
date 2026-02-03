import {
  FaRegCalendarAlt,
  FaRegEye,
  FaTag,
  FaUserCircle
} from 'react-icons/fa';
import { FiArrowLeft, FiHeart, FiShare2 } from 'react-icons/fi';
import { Link, useParams } from 'react-router';

import { useTogglePostLike } from '../../toggle-post-like/api/toggle-post-like';
import { usePostDetail } from '../api/view-post-detail';

export default function PostDetail() {
  const { id } = useParams();
  const { data } = usePostDetail(id);
  const { mutate: toggleLike } = useTogglePostLike();
  const likeCount = data.likes?.length || 0;

  return (
    <div className='mx-auto max-w-[1400px] px-6 py-10 bg-background text-foreground'>
      <Link
        to='/posts'
        className='inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-10 group'
      >
        <FiArrowLeft className='transition-transform group-hover:-translate-x-1' />
        QUAY LẠI DANH SÁCH
      </Link>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
        <div className='lg:sticky lg:top-10'>
          {data.images?.[0] && (
            <div className='relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/10 aspect-[4/5] lg:aspect-square bg-card'>
              <img
                src={data.images[0]}
                alt={data.title}
                className='h-full w-full object-cover'
              />
              {data.category && (
                <span className='absolute top-6 left-6 inline-flex items-center gap-2 rounded-xl bg-card/90 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary shadow-lg'>
                  <FaTag size={10} />
                  {data.category}
                </span>
              )}
            </div>
          )}
        </div>

        <div className='flex flex-col'>
          <div className='mb-6 space-y-4'>
            <div className='flex items-center justify-between'>
              {typeof data.views === 'number' && (
                <div className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                  <FaRegEye size={14} />
                  {data.views.toLocaleString()} lượt xem
                </div>
              )}

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => toggleLike(data._id)}
                  className='flex items-center gap-2 px-4 py-2 rounded-full hover:bg-accent text-muted-foreground hover:text-primary transition-all'
                >
                  <FiHeart size={20} />
                  <span className='font-bold'>{likeCount}</span>
                </button>

                <button className='p-2 rounded-full hover:bg-accent text-muted-foreground'>
                  <FiShare2 size={20} />
                </button>
              </div>
            </div>

            <h1 className='text-4xl sm:text-5xl font-black leading-tight tracking-tight'>
              {data.title}
            </h1>
          </div>

          <div className='flex items-center gap-8 py-6 border-y border-border mb-8'>
            {data.author?.name && (
              <div className='flex items-center gap-3'>
                <FaUserCircle size={35} className='text-muted-foreground' />
                <div>
                  <p className='text-[10px] uppercase font-black text-muted-foreground'>
                    Tác giả
                  </p>
                  <span className='text-sm font-bold'>{data.author.name}</span>
                </div>
              </div>
            )}

            {data.createdAt && (
              <div className='flex flex-col border-l border-border pl-8'>
                <p className='text-[10px] uppercase font-black text-muted-foreground'>
                  Ngày xuất bản
                </p>
                <div className='flex items-center gap-2 text-sm font-bold text-muted-foreground'>
                  <FaRegCalendarAlt className='text-primary' />
                  {new Date(data.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            )}
          </div>

          <div className='prose max-w-none mb-12 prose-p:text-muted-foreground prose-p:text-lg whitespace-pre-line'>
            {data.content}
          </div>

          {data.tags?.length > 0 && (
            <div className='pt-8 border-t border-border'>
              <div className='flex flex-wrap gap-2'>
                {data.tags.map(tag => (
                  <span
                    key={tag}
                    className='rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
