import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';

import { formatDateVI } from '~/lib/utils';

import { useAddPostComment } from '../../add-post-comment/api/add-post-comment';
import DeleteCommentModal from './delete-comment-modal';

export default function PostComments({ postId, comments = [] }) {
  const { mutate: addComment } = useAddPostComment();
  const [comment, setComment] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!comment.trim()) return;

    addComment({ postId, content: comment });
    setComment('');
  };

  return (
    <div className='rounded-[2rem] bg-card px-6 py-7 shadow-sm sm:px-8 sm:py-8'>
      <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm'>
            <FiSend size={18} />
          </div>

          <div>
            <h3 className='text-2xl font-black tracking-tight text-foreground'>
              Bình luận
            </h3>
            <p className='text-sm text-muted-foreground'>
              Chia sẻ cảm nhận của bạn về bài viết này
            </p>
          </div>
        </div>

        <span className='inline-flex w-fit items-center rounded-full bg-secondary px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground'>
          {comments.length} thảo luận
        </span>
      </div>

      <form onSubmit={handleSubmit} className='mb-10'>
        <div className='overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/[0.05] via-background to-background p-4 shadow-sm sm:p-5'>
          <div className='relative'>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder='Bạn đang nghĩ gì về bài viết này?'
              className='min-h-[150px] w-full resize-none rounded-[1.5rem] bg-background px-5 py-5 pr-5 text-[15px] text-foreground outline-none ring-1 ring-border/60 transition-all placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20'
            />

            <div className='mt-4 flex items-center justify-between gap-3'>
              <p className='text-xs font-medium text-muted-foreground'>
                Hãy giữ bình luận lịch sự và hữu ích cho cộng đồng.
              </p>

              <button className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95'>
                Gửi
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className='space-y-4'>
        {comments.map(c => (
          <div
            key={c._id}
            className='group rounded-[1.5rem] bg-background p-5 shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20'
          >
            <div className='flex gap-4'>
              <div className='shrink-0'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-sm'>
                  <FaUserCircle size={28} />
                </div>
              </div>

              <div className='min-w-0 flex-1'>
                <div className='mb-3 flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-black uppercase tracking-tight text-foreground'>
                      {c.author?.name}
                    </p>
                    <span className='inline-flex items-center rounded-full bg-muted/70 px-2.5 py-1 text-[10px] font-bold text-muted-foreground/70'>
                      {formatDateVI(c.createdAt)}
                    </span>
                  </div>

                  <div className='shrink-0 opacity-80 transition group-hover:opacity-100'>
                    <DeleteCommentModal postId={postId} commentId={c._id} />
                  </div>
                </div>

                <p className='whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground'>
                  {c.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
