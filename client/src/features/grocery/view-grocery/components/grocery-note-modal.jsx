import { useEffect, useState } from 'react';
import {
  IoChatboxEllipsesOutline,
  IoClose,
  IoSaveOutline
} from 'react-icons/io5';

import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';

import { useUpdateGrocery } from '../../update-grocery/api/update-grpcery';

export default function GroceryNoteModal({ open, onClose, grocery }) {
  const [note, setNote] = useState('');

  const mutation = useUpdateGrocery({
    onSuccess: onClose
  });

  useEffect(() => {
    if (open) {
      setNote(grocery?.notes || '');
    }
  }, [open, grocery]);

  if (!open) return null;

  const handleSave = () => {
    mutation.mutate({
      groceryId: grocery._id,
      data: { notes: note }
    });
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans normal-case tracking-normal'>
      <div
        className='absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-300'
        onClick={onClose}
      />

      <div
        onClick={e => e.stopPropagation()}
        className='
          relative z-10 w-full max-w-md overflow-hidden
          rounded-2xl border border-border bg-card
          shadow-xl animate-in zoom-in-95 duration-300
          font-sans normal-case tracking-normal
        '
      >
        <div className='p-6'>
          <div className='flex items-start justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <IoChatboxEllipsesOutline size={22} />
              </div>

              <div>
                <h3 className='text-lg font-semibold text-foreground'>
                  Ghi chú danh sách
                </h3>

                <p className='text-sm text-muted-foreground'>
                  Thêm lời nhắc cho chuyến đi chợ
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className='h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground'
            >
              <IoClose size={20} />
            </button>
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground ml-1'>
              Nội dung ghi chú
            </label>

            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder='Nhập nội dung ghi chú tại đây...'
              className='
                min-h-[150px] p-4 rounded-lg
                bg-muted/20 border-border
                focus-visible:ring-1 focus-visible:ring-primary/40
                text-base
                transition-all resize-none
              '
            />
          </div>

          <div className='flex items-center gap-3 mt-6'>
            <Button
              variant='ghost'
              onClick={onClose}
              className='flex-1 h-10 rounded-lg'
            >
              Hủy bỏ
            </Button>

            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              className='flex-[1.5] h-10 rounded-lg gap-2'
            >
              {mutation.isPending ? (
                <>
                  <div className='h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Đang lưu...
                </>
              ) : (
                <>
                  <IoSaveOutline size={18} />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
