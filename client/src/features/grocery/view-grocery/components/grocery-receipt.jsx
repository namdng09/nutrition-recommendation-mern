import React, { useEffect, useState } from 'react';
import { HiChevronDown, HiChevronUp, HiOutlineCalendar } from 'react-icons/hi';
import { IoReceiptOutline, IoSparklesOutline } from 'react-icons/io5';

import { formatDateVI } from '~/lib/utils';

import DeleteGroceryButton from '../../delete-grocery/components/delete-grocery-button';
import { useUpdateGrocery } from '../../update-grocery/api/update-grpcery';
import AddIngredientButton from './add-ingredient-button';
import GroceryIngredientsList from './grocery-ingredients-list';

const GroceryReceipt = ({ list, isExpanded = false, onToggle }) => {
  const date = list?.date?.[0];
  const ingredients = list?.ingredients ?? [];
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [nameDraft, setNameDraft] = useState(list?.name ?? '');
  const [noteDraft, setNoteDraft] = useState(list?.notes ?? '');

  const { mutate, isPending } = useUpdateGrocery({
    onSuccess: () => {
      setIsEditingName(false);
      setIsEditingNote(false);
    }
  });

  useEffect(() => {
    setNameDraft(list?.name ?? '');
    setNoteDraft(list?.notes ?? '');
  }, [list?.name, list?.notes]);

  const handleSaveName = () => {
    const nextName = nameDraft.trim();
    if (!nextName) return;
    if (nextName === (list?.name ?? '')) {
      setIsEditingName(false);
      return;
    }

    mutate({
      groceryId: list._id,
      data: { name: nextName }
    });
  };

  const handleSaveNote = () => {
    const nextNote = noteDraft.trim();
    if (nextNote === (list?.notes ?? '')) {
      setIsEditingNote(false);
      return;
    }

    mutate({
      groceryId: list._id,
      data: { notes: nextNote }
    });
  };

  const handleCancelName = () => {
    setNameDraft(list?.name ?? '');
    setIsEditingName(false);
  };

  const handleCancelNote = () => {
    setNoteDraft(list?.notes ?? '');
    setIsEditingNote(false);
  };

  if (!list) return null;

  return (
    <div className='group relative flex flex-col drop-shadow-2xl transition-all duration-500 hover:-translate-y-1'>
      <div className='h-3 bg-card rounded-t-2xl border-b border-dashed border-border' />

      <div
        className={`flex flex-col bg-card px-8 pt-10 relative overflow-hidden border-x border-border ${
          isExpanded ? 'pb-12' : 'pb-6'
        }`}
      >
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

        <div
          className={`relative text-center space-y-4 border-b-2 border-primary ${
            isExpanded ? 'mb-10 pb-8' : 'mb-0 pb-5'
          }`}
        >
          <div className='absolute right-0 top-0'>
            <DeleteGroceryButton groceryId={list._id} />
          </div>

          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary text-primary'>
            <IoReceiptOutline size={32} />
          </div>

          {isEditingName ? (
            <div className='mx-auto w-full max-w-md space-y-3'>
              <input
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                placeholder='Nhập tên danh sách'
                className='w-full rounded-xl border border-border bg-background px-4 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/40'
              />

              <div className='flex items-center justify-center gap-2'>
                <button
                  onClick={handleSaveName}
                  disabled={isPending}
                  className='rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60'
                >
                  Lưu
                </button>

                <button
                  onClick={handleCancelName}
                  disabled={isPending}
                  className='rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold text-foreground disabled:opacity-60'
                >
                  Huỷ
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className='text-2xl md:text-[28px] font-extrabold uppercase italic underline-offset-4 hover:underline'
            >
              {list?.name}
            </button>
          )}

          {date && (
            <div className='flex items-center justify-center gap-4 text-l font-mono font-bold uppercase text-muted-foreground'>
              <span className='flex items-center gap-2'>
                <HiOutlineCalendar className='text-primary text-lg' />
                {formatDateVI(date, 'dd/MM/yyyy')}
              </span>
            </div>
          )}
        </div>

        {isExpanded && (
          <>
            <div className='flex-1 space-y-2 mb-10'>
              <div className='flex justify-between items-center text-xs font-mono font-black text-muted-foreground mb-4 px-2 uppercase tracking-[0.3em]'>
                <span>Nguyên liệu</span>

                <div className='flex items-center gap-2'>
                  <AddIngredientButton groceryId={list._id} />
                </div>
              </div>

              <GroceryIngredientsList
                ingredients={ingredients}
                groceryId={list._id}
              />
            </div>

            <div className='border-t-2 border-dashed border-border pt-6'>
              {isEditingNote ? (
                <div className='space-y-3'>
                  <textarea
                    value={noteDraft}
                    onChange={e => setNoteDraft(e.target.value)}
                    placeholder='Nhập ghi chú danh sách...'
                    className='min-h-[110px] w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40'
                  />

                  <div className='flex items-center gap-2'>
                    <button
                      onClick={handleSaveNote}
                      disabled={isPending}
                      className='rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60'
                    >
                      Lưu
                    </button>

                    <button
                      onClick={handleCancelNote}
                      disabled={isPending}
                      className='rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold text-foreground disabled:opacity-60'
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className='w-full rounded-xl border-l-4 border-primary bg-muted/30 p-5 text-left'
                >
                  <div className='flex gap-3 text-sm font-mono text-muted-foreground'>
                    <IoSparklesOutline className='text-primary' size={18} />
                    <span>
                      {list?.notes
                        ? `"NOTE: ${list.notes}"`
                        : 'Nhấn để thêm ghi chú'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className='relative h-5 w-full overflow-visible flex'>
        <button
          onClick={onToggle}
          className='absolute left-1/2 -top-3 z-20 -translate-x-1/2 rounded-full border border-border bg-background p-2 text-foreground/80 shadow-sm transition hover:bg-muted'
          aria-label={isExpanded ? 'Thu gọn thẻ' : 'Mở rộng thẻ'}
        >
          {isExpanded ? <HiChevronUp size={18} /> : <HiChevronDown size={18} />}
        </button>

        {[...Array(26)].map((_, i) => (
          <div
            key={i}
            className='w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[11px] border-t-card'
          />
        ))}
      </div>
    </div>
  );
};

export default GroceryReceipt;
