import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiChatAlt2, HiX } from 'react-icons/hi';
import { useSelector } from 'react-redux';

import { ROLE } from '~/constants/role';

import { useCreateFeedback } from '../api/create-feedback';
import FeedbackChatPanel from './feedback-chat-panel';

export default function FeedbackChatWidget() {
  const { user, loading } = useSelector(state => state.auth);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content:
        'Xin chào, bạn có góp ý gì cho hệ thống không? Hãy chọn loại feedback rồi gửi cho mình nhé.'
    }
  ]);

  const scrollRef = useRef(null);

  const form = useForm({
    defaultValues: {
      type: 'Nội dung',
      content: ''
    }
  });

  const selectedType = form.watch('type');

  const { mutate: createFeedback, isPending } = useCreateFeedback({
    onSuccess: () => {
      const content = form.getValues('content')?.trim();
      const type = form.getValues('type');

      if (content) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: 'user',
            content: `[${type}] ${content}`
          },
          {
            id: Date.now() + 1,
            role: 'bot',
            content:
              'Mình đã ghi nhận feedback của bạn và gửi cho hệ thống rồi. Cảm ơn bạn nhé!'
          }
        ]);
      }

      form.reset({
        type,
        content: ''
      });
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const onSubmit = values => {
    const content = values.content?.trim();

    if (!content) {
      form.setError('content', {
        type: 'manual',
        message: 'Vui lòng nhập nội dung feedback'
      });
      return;
    }

    createFeedback({
      type: values.type || 'Nội dung',
      content
    });
  };

  const isRestrictedRole =
    user?.role === ROLE.NUTRITIONIST || user?.role === ROLE.ADMIN;

  if (loading || isRestrictedRole) {
    return null;
  }

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'>
      {open && (
        <FeedbackChatPanel
          form={form}
          messages={messages}
          isPending={isPending}
          selectedType={selectedType}
          scrollRef={scrollRef}
          onClose={() => setOpen(false)}
          onSubmit={onSubmit}
        />
      )}

      <button
        type='button'
        onClick={() => setOpen(prev => !prev)}
        className='flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 active:scale-95'
        title='Gửi feedback'
      >
        {open ? <HiX size={24} /> : <HiChatAlt2 size={24} />}
      </button>
    </div>
  );
}
