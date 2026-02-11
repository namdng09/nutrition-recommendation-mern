import { format } from 'date-fns';
import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Input } from '~/components/ui/input';
import { formatDateVI } from '~/lib/utils';

import { useCreateGrocery } from '../api/create-grocery';

export default function CreateGroceryModal({ open, onClose }) {
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState([]);

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

    dates.forEach(d => {
      mutate({
        name: finalTitle,
        date: [format(d, 'yyyy-MM-dd')]
      });
    });
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 w-[540px] rounded-3xl bg-card border border-border p-8 shadow-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-black'>Tạo danh sách mới</h2>

          <button onClick={onClose}>
            <IoClose size={22} />
          </button>
        </div>

        <Input
          placeholder='Tên danh sách (mặc định: Danh sách mua sắm của tôi)'
          value={title}
          onChange={e => setTitle(e.target.value)}
          className='mb-6'
        />

        <div className='rounded-xl border border-border p-4 bg-muted/20 mb-4 w-full'>
          <Calendar
            mode='multiple'
            selected={dates}
            onSelect={d => setDates(d ?? [])}
            className='w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full'
          />
        </div>

        {dates.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-6'>
            {dates.map(d => (
              <span
                key={d.toISOString()}
                className='bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold'
              >
                {formatDateVI(d)}
              </span>
            ))}
          </div>
        )}

        <div className='flex justify-end gap-3'>
          <Button variant='ghost' onClick={onClose}>
            Huỷ
          </Button>

          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Đang tạo...' : 'Tạo danh sách'}
          </Button>
        </div>
      </div>
    </div>
  );
}
