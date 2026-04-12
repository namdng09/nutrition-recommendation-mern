import { HiPaperAirplane, HiSparkles, HiX } from 'react-icons/hi';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '~/components/ui/form';
import { Textarea } from '~/components/ui/textarea';

const FEEDBACK_TYPES = ['Nội dung', 'Hệ thống'];

export default function FeedbackChatPanel({
  form,
  messages,
  isPending,
  selectedType,
  scrollRef,
  onClose,
  onSubmit
}) {
  return (
    <div className='w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-3xl border border-border bg-background shadow-2xl'>
      <div className='flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white/15'>
            <HiSparkles size={20} />
          </div>
          <div>
            <p className='text-sm font-black'>Feedback Assistant</p>
            <p className='text-xs text-primary-foreground/80'>
              Gửi góp ý nhanh cho hệ thống
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={onClose}
          className='rounded-full p-2 transition hover:bg-white/10'
        >
          <HiX size={18} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className='max-h-[360px] space-y-3 overflow-y-auto bg-muted/20 px-4 py-4'
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background text-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isPending && (
          <div className='flex justify-start'>
            <div className='rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground shadow-sm'>
              Đang gửi feedback...
            </div>
          </div>
        )}
      </div>

      <div className='border-t border-border bg-background p-3'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='flex items-center gap-2'>
                      {FEEDBACK_TYPES.map(type => {
                        const active = field.value === type;

                        return (
                          <button
                            key={type}
                            type='button'
                            onClick={() => field.onChange(type)}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                              active
                                ? 'bg-primary text-primary-foreground shadow'
                                : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='content'
              rules={{
                required: 'Vui lòng nhập nội dung feedback',
                minLength: {
                  value: 5,
                  message: 'Feedback cần ít nhất 5 ký tự'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={
                        selectedType === 'Hệ thống'
                          ? 'Mô tả lỗi, vấn đề hiển thị, thao tác gây lỗi...'
                          : 'Nhập góp ý của bạn...'
                      }
                      className='resize-none rounded-2xl'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex items-center justify-between gap-3'>
              <p className='text-xs text-muted-foreground'>
                Loại đã chọn:{' '}
                <span className='font-semibold'>{selectedType}</span>
              </p>

              <Button
                type='submit'
                disabled={isPending}
                className='rounded-full'
              >
                {isPending ? (
                  'Đang gửi...'
                ) : (
                  <span className='flex items-center gap-2'>
                    Gửi
                    <HiPaperAirplane size={14} />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
