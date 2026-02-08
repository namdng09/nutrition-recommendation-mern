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
    <div className='border-t border-border pt-12'>
      <div className='flex items-center gap-3 mb-8'>
        <h3 className='text-2xl font-black tracking-tight'>Bình luận</h3>
        <span className='px-3 py-1 bg-secondary rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-wider'>
          {comments.length} THẢO LUẬN
        </span>
      </div>

      <form onSubmit={handleSubmit} className='mb-12'>
        <div className='relative group'>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder='Bạn đang nghĩ gì về bài viết này?'
            className='w-full border-2 border-border bg-card/50 rounded-[2rem] p-6 pb-16 focus:border-primary/50 focus:bg-background outline-none resize-none min-h-[140px] transition-all'
          />
          <button className='absolute bottom-4 right-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all'>
            Gửi
            <FiSend />
          </button>
        </div>
      </form>

      <div className='space-y-4'>
        {comments.map(c => (
          <div
            key={c._id}
            className='flex gap-5 p-5 rounded-[1.5rem] border border-border bg-card/30 hover:border-primary/20 hover:bg-card/50 transition-all duration-300'
          >
            <div className='flex-shrink-0'>
              <div className='w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground'>
                <FaUserCircle size={28} />
              </div>
            </div>

            <div className='flex-grow'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex flex-col'>
                  <p className='font-black text-sm text-foreground uppercase tracking-tight'>
                    {c.author?.name}
                  </p>
                  <span className='text-[10px] font-bold text-muted-foreground/60'>
                    {formatDateVI(c.createdAt)}
                  </span>
                </div>

                <DeleteCommentModal postId={postId} commentId={c._id} />
              </div>

              <p className='text-muted-foreground leading-relaxed text-[15px]'>
                {c.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
