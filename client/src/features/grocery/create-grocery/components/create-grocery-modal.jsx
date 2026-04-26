import { format } from 'date-fns';
import { useState } from 'react';
import { IoCheckmarkCircle, IoCreateOutline } from 'react-icons/io5';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { formatDateVI } from '~/lib/utils';

import { useGroceries } from '../../view-grocery/api/view-grocery';
import { useCreateGrocery } from '../api/create-grocery';
import CreateGroceryCalendar from './create-grocery-calender';
import CreateGroceryHeader from './create-grocery-header';
import CreateGroceryInput from './create-grocery-input';

export default function CreateGroceryModal({ open, onClose }) {
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState([]);

  const { data } = useGroceries();

  const existingDates =
    data?.docs?.flatMap(g =>
      (g.date ?? []).map(d => format(new Date(d), 'yyyy-MM-dd'))
    ) ?? [];

  const handleClose = () => {
    setTitle('');
    setDates([]);
    onClose();
  };

  const { mutate, isPending } = useCreateGrocery({
    onSuccess: () => {
      setTitle('');
      setDates([]);
      onClose();
    }
  });

  if (!open) return null;

  const handleCreate = () => {
    if (dates.length === 0) return;

    const finalTitle = title.trim() || 'Danh sách mua sắm của tôi';
    const selected = dates.map(d => format(d, 'yyyy-MM-dd'));
    const newDates = selected.filter(d => !existingDates.includes(d));

    if (newDates.length === 0) {
      toast.info('Các ngày đã tồn tại danh sách');
      return;
    }

    newDates.forEach(d => {
      mutate({
        name: finalTitle,
        date: [d]
      });
    });
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 animate-in fade-in bg-background/60 duration-300 backdrop-blur-md'
        onClick={handleClose}
      />

      <div className='relative z-10 flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300'>
        <div className='space-y-6 overflow-y-auto p-8'>
          <CreateGroceryHeader onClose={handleClose} />

          <CreateGroceryInput
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <CreateGroceryCalendar dates={dates} setDates={setDates} />

          <div className='min-h-[32px]'>
            {dates.length > 0 ? (
              <div className='max-h-36 overflow-y-auto pr-1'>
                <div className='flex flex-wrap gap-2'>
                  {dates.map(d => (
                    <div
                      key={d.toISOString()}
                      className='flex items-center gap-1.5 rounded-xl border border-primary bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-sm'
                    >
                      <IoCheckmarkCircle size={14} />
                      {formatDateVI(d)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className='ml-1 text-[11px] italic text-muted-foreground/60'>
                * Vui lòng chọn ít nhất một ngày
              </p>
            )}
          </div>
        </div>

        <div className='border-t border-border bg-card p-8 pt-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              onClick={handleClose}
              className='h-12 flex-1 rounded-2xl font-bold'
            >
              Huỷ bỏ
            </Button>

            <Button
              onClick={handleCreate}
              disabled={isPending || dates.length === 0}
              className='h-12 flex-[2] gap-2 rounded-2xl font-bold shadow-[0_8px_20px_-6px_rgba(var(--primary),0.3)]'
            >
              {isPending ? (
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Đang xử lý...
                </div>
              ) : (
                <>
                  <IoCreateOutline size={20} />
                  Xác nhận tạo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
