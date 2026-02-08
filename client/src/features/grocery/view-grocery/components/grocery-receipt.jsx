import React from 'react';
import { HiOutlineCalendar } from 'react-icons/hi';
import { IoReceiptOutline, IoSparklesOutline } from 'react-icons/io5';
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill
} from 'react-icons/ri';

const GroceryReceipt = ({ list }) => {
  return (
    <div
      className='
      group relative flex flex-col
      drop-shadow-2xl
      transition-all duration-500
      hover:-translate-y-1
    '
    >
      <div className='h-3 bg-card rounded-t-2xl border-b border-dashed border-border' />

      <div
        className='
        flex flex-col bg-card
        px-8 pt-10 pb-12
        relative overflow-hidden
        border-x border-border
      '
      >
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

        <div className='relative mb-10 text-center space-y-4 border-b-2 border-primary pb-8'>
          <div
            className='
            mx-auto flex h-16 w-16 items-center justify-center
            rounded-full border-2 border-primary text-primary
          '
          >
            <IoReceiptOutline size={32} />
          </div>

          <h2 className='text-2xl md:text-[28px] font-extrabold uppercase italic'>
            {list.name}
          </h2>

          <div
            className='
            flex items-center justify-center gap-4
            text-sm font-mono font-bold uppercase text-muted-foreground
          '
          >
            <span className='flex items-center gap-2'>
              <HiOutlineCalendar className='text-primary text-lg' />
              {new Date(list.date).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <div className='absolute -left-10 top-1/2 h-7 w-7 rounded-full bg-background border border-border' />
          <div className='absolute -right-10 top-1/2 h-7 w-7 rounded-full bg-background border border-border' />
        </div>

        <div className='flex-1 space-y-2 mb-10'>
          <div
            className='
            flex justify-between
            text-xs font-mono font-black
            text-muted-foreground mb-4 px-2
            uppercase tracking-[0.3em]
          '
          >
            <span>Nguyên liệu</span>
            <span>Khối lượng</span>
          </div>

          {list.ingredients.map(item => (
            <div
              key={item._id}
              className={`
                flex items-center justify-between
                px-2 py-4 border-b border-border/40 last:border-0
                ${item.isPurchased ? 'opacity-40 grayscale' : 'hover:bg-accent/5'}
              `}
            >
              <div className='flex items-center gap-5'>
                {item.isPurchased ? (
                  <RiCheckboxCircleFill className='h-7 w-7 text-primary' />
                ) : (
                  <RiCheckboxBlankCircleLine className='h-7 w-7 text-muted-foreground/40' />
                )}

                <div>
                  <div
                    className={`text-lg font-bold font-mono uppercase ${item.isPurchased && 'line-through'}`}
                  >
                    {item.name}
                  </div>

                  {item.notes && (
                    <div className='text-xs text-muted-foreground italic mt-1'>
                      # {item.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className='font-mono font-extrabold text-lg text-primary'>
                {item.quantity.toLocaleString()}G
              </div>
            </div>
          ))}
        </div>

        {list.notes && (
          <div className='border-t-2 border-dashed border-border pt-6'>
            <div
              className='
              flex gap-3 text-sm font-mono text-muted-foreground
              bg-muted/30 p-5 rounded-xl border-l-4 border-primary
            '
            >
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

      <div
        className={`
        absolute top-12 right-10 px-5 py-2 text-xs font-black uppercase
        border-2 rounded-xl shadow-sm
        ${
          list.status === 'done'
            ? 'text-green-light border-green-300/50'
            : 'text-orange-light border-orange-300/50'
        }
      `}
      >
        {list.status}
      </div>
    </div>
  );
};

export default GroceryReceipt;
