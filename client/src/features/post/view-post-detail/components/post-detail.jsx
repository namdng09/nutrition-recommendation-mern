import {
  FaRegCalendarAlt,
  FaRegEye,
  FaTag,
  FaUserCircle
} from 'react-icons/fa';
import { FiArrowLeft, FiHeart, FiShare2 } from 'react-icons/fi';
import { Link, useParams } from 'react-router';

import { formatDateVI } from '~/lib/utils';

import { useTogglePostLike } from '../../toggle-post-like/api/toggle-post-like';
import { usePostDetail } from '../api/view-post-detail';
import PostComments from './post-comment';

export default function PostDetail() {
  const { id } = useParams();
  const { data } = usePostDetail(id);
  const { mutate: toggleLike } = useTogglePostLike();
  const likeCount = data?.likes?.length || 0;

  return (
    <div className='mx-auto max-w-[1300px] bg-background text-foreground transition-all duration-300'>
      <Link
        to='/posts'
        className='inline-flex items-center gap-2 text-[11px] font-black tracking-widest text-muted-foreground hover:text-primary transition-all mb-12 group uppercase'
      >
        <FiArrowLeft className='text-lg transition-transform group-hover:-translate-x-1' />
        Quay lại danh sách
      </Link>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-16 items-start'>
        <div className='lg:col-span-5 lg:sticky lg:top-10'>
          {data.images?.[0] && (
            <div className='relative overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] aspect-[4/5] lg:aspect-square bg-card group'>
              <img
                src={data.images[0]}
                alt={data.title}
                className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
              />
              {data.category && (
                <span className='absolute top-8 left-8 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-primary shadow-xl'>
                  <FaTag size={10} />
                  {data.category}
                </span>
              )}
            </div>
          )}
        </div>

        <div className='lg:col-span-7 flex flex-col'>
          <div className='mb-8 space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60'>
                  <FaRegEye size={16} />
                  {data.views?.toLocaleString()} views
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <button
                  onClick={() => toggleLike(data._id)}
                  className='flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95 group'
                >
                  <FiHeart
                    size={18}
                    className='group-hover:fill-current transition-colors'
                  />
                  <span className='font-black text-sm'>{likeCount}</span>
                </button>

                <button className='p-3 rounded-full hover:bg-secondary text-muted-foreground transition-colors'>
                  <FiShare2 size={18} />
                </button>
              </div>
            </div>

            <h1 className='text-5xl sm:text-6xl font-black leading-[1.1] tracking-tight text-balance'>
              {data.title}
            </h1>
          </div>

          <div className='flex items-center gap-12 py-8 border-y border-border/60 mb-10'>
            <div className='flex items-center gap-4'>
              <div className='p-0.5 rounded-full ring-2 ring-primary/20'>
                <FaUserCircle size={40} className='text-muted-foreground/40' />
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-black uppercase text-muted-foreground leading-none mb-1'>
                  Tác giả
                </span>
                <span className='text-base font-bold'>{data.author?.name}</span>
              </div>
            </div>

            <div className='flex flex-col border-l border-border pl-12'>
              <span className='text-[10px] font-black uppercase text-muted-foreground leading-none mb-1'>
                Ngày đăng
              </span>
              <div className='flex items-center gap-2 text-sm font-bold text-muted-foreground/80'>
                <FaRegCalendarAlt className='text-primary opacity-70' />
                {formatDateVI(data.createdAt)}
              </div>
            </div>
          </div>

          <div className='prose prose-lg max-w-none mb-16 prose-p:text-muted-foreground/90 prose-p:leading-relaxed prose-headings:font-black whitespace-pre-line'>
            {data.content}
          </div>

          <PostComments postId={data._id} comments={data.comments} />
        </div>
      </div>
    </div>
  );
}
