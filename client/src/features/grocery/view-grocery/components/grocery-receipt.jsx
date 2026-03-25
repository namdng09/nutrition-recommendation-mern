import React from 'react';
import { HiOutlineCalendar } from 'react-icons/hi';
import { IoReceiptOutline, IoSparklesOutline } from 'react-icons/io5';

import { formatDateVI } from '~/lib/utils';

import DeleteGroceryButton from '../../delete-grocery/components/delete-grocery-button';
import AddIngredientButton from './add-ingredient-button';
import GroceryIngredientsList from './grocery-ingredients-list';
import NoteActionsMenu from './note-action-menu';

const GroceryReceipt = ({ list }) => {
  if (!list) return null;

  const date = list?.date?.[0];
  const ingredients = list?.ingredients ?? [];

  return (
    <div className='group relative flex flex-col drop-shadow-2xl transition-all duration-500 hover:-translate-y-1'>
      <div className='h-3 bg-card rounded-t-2xl border-b border-dashed border-border' />

      <div className='flex flex-col bg-card px-8 pt-10 pb-12 relative overflow-hidden border-x border-border'>
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

        <div className='relative mb-10 text-center space-y-4 border-b-2 border-primary pb-8'>
          <div className='absolute right-0 top-0'>
            <DeleteGroceryButton groceryId={list._id} />
          </div>

          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary text-primary'>
            <IoReceiptOutline size={32} />
          </div>

          {list?.name && (
            <h2 className='text-2xl md:text-[28px] font-extrabold uppercase italic'>
              {list.name}
            </h2>
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

        <div className='flex-1 space-y-2 mb-10'>
          <div className='flex justify-between items-center text-xs font-mono font-black text-muted-foreground mb-4 px-2 uppercase tracking-[0.3em]'>
            <span>Nguyên liệu</span>

            <div className='flex items-center gap-2'>
              <AddIngredientButton groceryId={list._id} />

              <NoteActionsMenu grocery={list} />
            </div>
          </div>

          <GroceryIngredientsList
            ingredients={ingredients}
            groceryId={list._id}
          />
        </div>

        {list?.notes && (
          <div className='border-t-2 border-dashed border-border pt-6'>
            <div className='flex gap-3 text-sm font-mono text-muted-foreground bg-muted/30 p-5 rounded-xl border-l-4 border-primary'>
              <IoSparklesOutline className='text-primary' size={18} />
              <span>"NOTE: {list.notes}"</span>
            </div>
          </div>
        )}
      </div>

      <div className='relative h-5 w-full overflow-hidden flex'>
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
