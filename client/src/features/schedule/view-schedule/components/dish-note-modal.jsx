import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { useUpdateScheduleMeals } from '~/features/schedule/update-schedule/api/update-schedule';

export default function DishNoteModal({
  open,
  onClose,
  mealType,
  scheduleId,
  scheduleMeals
}) {
  const [note, setNote] = useState('');
  const updateMealsMutation = useUpdateScheduleMeals();

  if (!open) return null;

  const handleSave = () => {
    const updatedMeals = scheduleMeals.map(meal => ({
      mealType: meal.mealType,
      notes: meal.mealType === mealType ? note : meal.notes || '',
      dishes: meal.dishes.map(d => ({
        dishId: d.dishId || d._id,
        servings: d.servings ?? 1
      }))
    }));

    updateMealsMutation.mutate(
      { scheduleId, meals: updatedMeals },
      { onSuccess: onClose }
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Overlay với hiệu ứng mờ nhẹ cao cấp */}
      <div
        className='absolute inset-0 bg-background/60 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 w-full max-w-md rounded-[32px] border-2 border-border/60 bg-card p-8 shadow-2xl'>
        {/* BADGE TRANG TRÍ (Optional) */}
        <div className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2D6A4F] px-4 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg'>
          Meal Note
        </div>

        {/* HEADER */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-black text-[#1B4332] tracking-tight'>
              Ghi chú bữa ăn
            </h3>
            <p className='text-[11px] font-bold uppercase tracking-widest text-[#2D6A4F]/60 mt-0.5'>
              {mealType}
            </p>
          </div>
          <button
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors'
          >
            <IoClose size={24} className='text-muted-foreground' />
          </button>
        </div>

        {/* TEXTAREA - Sửa lại để to và dễ nhìn hơn */}
        <div className='relative group'>
          <Textarea
            placeholder='Ví dụ: ít muối, không đường, ăn trước 18h...'
            value={note}
            onChange={e => setNote(e.target.value)}
            className='min-h-[140px] rounded-[20px] border-2 border-border/60 bg-muted/20 p-4 text-sm font-medium focus-visible:ring-[#2D6A4F]/20 focus-visible:border-[#2D6A4F] transition-all resize-none'
          />
        </div>

        {/* ACTIONS - Nút bấm to và phong cách */}
        <div className='mt-8 flex flex-col sm:flex-row justify-end gap-3'>
          <Button
            variant='ghost'
            onClick={onClose}
            className='h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted'
          >
            Huỷ bỏ
          </Button>
          <Button
            onClick={handleSave}
            className='h-12 rounded-2xl bg-[#2D6A4F] px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#2D6A4F]/20 hover:bg-[#1B4332] active:scale-95 transition-all'
          >
            Lưu ghi chú
          </Button>
        </div>
      </div>
    </div>
  );
}
