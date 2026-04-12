import {
  FaRegCalendarAlt,
  FaRegEye,
  FaTag,
  FaUserCircle
} from 'react-icons/fa';
import { FiArrowLeft, FiHeart } from 'react-icons/fi';
import { Link, useParams } from 'react-router';

import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { formatDateVI } from '~/lib/utils';

import { useTogglePostLike } from '../../toggle-post-like/api/toggle-post-like';
import { usePostDetail } from '../api/view-post-detail';
import PostComments from './post-comment';

export default function PostDetail() {
  const { id } = useParams();
  const { data } = usePostDetail(id);
  const { data: profile } = useProfile();
  const { mutate: toggleLike, isPending } = useTogglePostLike();

  const likeIds = (data?.likes || []).map(item =>
    typeof item === 'string' ? item : item?._id
  );

  const isLiked = profile?._id ? likeIds.includes(profile._id) : false;
  const likeCount = data?.likes?.length || 0;

  return (
    <div className='mx-auto max-w-[1300px] bg-background text-foreground transition-all duration-300'>
      <Link
        to='/posts'
        className='group mb-10 inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary'
      >
        <FiArrowLeft className='text-base transition-transform duration-300 group-hover:-translate-x-1' />
        Quay lại danh sách
      </Link>

      <div className='grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-16'>
        <div className='lg:col-span-5 lg:sticky lg:top-10'>
          {data.images?.[0] && (
            <div className='group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-card shadow-[0_20px_60px_rgba(0,0,0,0.10)] sm:rounded-[2.5rem] lg:aspect-[4/4.8]'>
              <img
                src={data.images[0]}
                alt={data.title}
                className='h-full w-full object-cover transition-transform'
              />

              <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent' />

              {data.category && (
                <span className='absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-primary shadow-lg backdrop-blur-md sm:left-8 sm:top-8 sm:px-5'>
                  <FaTag size={10} />
                  {data.category}
                </span>
              )}
            </div>
          )}
        </div>

        <div className='flex flex-col lg:col-span-7'>
          <div className='mb-8 rounded-[2rem] bg-gradient-to-br from-primary/[0.05] via-background to-background p-6 shadow-sm sm:p-8'>
            <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/70'>
                <div className='inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5'>
                  <FaRegEye size={14} />
                  {data.views?.toLocaleString()} lượt đã xem
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <button
                  onClick={() => toggleLike(data._id)}
                  disabled={isPending}
                  className='group flex items-center gap-2 rounded-full bg-secondary/60 px-5 py-2.5 transition-all hover:bg-primary/10 hover:text-primary active:scale-95 disabled:opacity-60'
                >
                  <FiHeart
                    size={18}
                    className={`transition-all ${
                      isLiked
                        ? 'fill-pink-500 text-pink-500'
                        : 'text-current group-hover:fill-current'
                    }`}
                  />
                  <span className='text-sm font-black'>{likeCount}</span>
                </button>
              </div>
            </div>

            <h1 className='text-balance text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl'>
              {data.title}
            </h1>
          </div>

          <div className='mb-10 grid grid-cols-1 gap-4 rounded-[2rem] bg-card p-5 shadow-sm sm:grid-cols-2 sm:p-6'>
            <div className='flex items-center gap-4 rounded-[1.5rem] bg-muted/40 p-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-2 ring-primary/10'>
                <FaUserCircle size={26} className='text-muted-foreground/40' />
              </div>

              <div className='flex flex-col'>
                <span className='mb-1 text-[10px] font-black uppercase leading-none tracking-[0.16em] text-muted-foreground'>
                  Tác giả
                </span>
                <span className='text-base font-bold'>{data.author?.name}</span>
              </div>
            </div>

            <div className='flex items-center gap-4 rounded-[1.5rem] bg-muted/40 p-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-2 ring-primary/10'>
                <FaRegCalendarAlt
                  className='text-primary opacity-80'
                  size={22}
                />
              </div>

              <div className='flex flex-col'>
                <span className='mb-1 text-[10px] font-black uppercase leading-none tracking-[0.16em] text-muted-foreground'>
                  Ngày đăng
                </span>
                <span className='text-sm font-bold text-foreground/80'>
                  {formatDateVI(data.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className='mb-16 rounded-[2rem] bg-card px-6 py-7 shadow-sm sm:px-8 sm:py-8'>
            <div className='prose prose-lg max-w-none whitespace-pre-line prose-headings:font-black prose-p:leading-relaxed prose-p:text-muted-foreground/90'>
              {data.content}
            </div>
          </div>

          <PostComments postId={data._id} comments={data.comments} />
        </div>
      </div>
    </div>
  );
}
