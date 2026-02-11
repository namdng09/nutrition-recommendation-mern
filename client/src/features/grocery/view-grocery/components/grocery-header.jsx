import React, { useState } from 'react';
import { HiOutlineAdjustments, HiOutlineSearch, HiPlus } from 'react-icons/hi';
import { IoFilterOutline } from 'react-icons/io5';

import CreateGroceryModal from '../../create-grocery/components/create-grocery-modal';
import { useGroceries } from '../api/view-grocery';

const GroceryHeader = () => {
  const [openModal, setOpenModal] = useState(false);

  const { data } = useGroceries();
  const lists = data?.docs ?? [];
  const [active, setActive] = useState('all');
  const total = lists.length;
  const done = lists.filter(
    l => l.ingredients.length && l.ingredients.every(i => i.isPurchased)
  ).length;

  const pending = total - done;

  return (
    <div className='mb-10 space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-4xl font-black tracking-tight'>
            Giỏ hàng <span className='text-primary'>thông minh</span>
          </h1>

          <p className='mt-1 text-sm font-medium text-muted-foreground'>
            Quản lý nguyên liệu và tối ưu dinh dưỡng cùng EatDee AI
          </p>
        </div>

        <>
          <button
            onClick={() => setOpenModal(true)}
            className='
      group
      flex items-center gap-2 rounded-2xl
      bg-primary px-6 py-3.5 text-sm font-bold
      text-primary-foreground shadow-lg shadow-primary/25
      transition-all duration-200
      hover:scale-[1.02]
      active:scale-95
      focus:outline-none focus:ring-4 focus:ring-primary/30
    '
          >
            <HiPlus className='text-xl transition group-hover:rotate-90' />

            <span>Tạo danh sách mới</span>
          </button>

          <CreateGroceryModal
            open={openModal}
            onClose={() => setOpenModal(false)}
          />
        </>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row'>
        <div className='relative flex-1'>
          <HiOutlineSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground/50' />

          <input
            placeholder='Tìm kiếm danh sách đi chợ...'
            className='
              w-full rounded-2xl border border-border/40 bg-card
              px-12 py-3.5 text-sm
              transition focus:border-primary/50
              focus:outline-none focus:ring-4 focus:ring-primary/5
            '
          />
        </div>

        <div className='flex gap-2'>
          <button
            className='
    inline-flex items-center justify-center gap-2
    rounded-2xl border border-border/40 bg-card
    px-5 py-3.5 text-sm font-bold text-foreground/70
    transition-all hover:bg-muted
    whitespace-nowrap
  '
          >
            <IoFilterOutline className='text-lg' />
            Lọc
          </button>

          <button
            className='
    inline-flex items-center justify-center gap-2
    rounded-2xl border border-border/40 bg-card
    px-5 py-3.5 text-sm font-bold text-foreground/70
    transition-all hover:bg-muted
    whitespace-nowrap
  '
          >
            <HiOutlineAdjustments className='text-lg' />
            Sắp xếp
          </button>
        </div>
      </div>

      <div className='flex gap-4 overflow-x-auto pb-2 no-scrollbar'>
        <QuickStat
          label='Tất cả'
          count={total}
          isActive={active === 'all'}
          onClick={() => setActive('all')}
        />

        <QuickStat
          label='Đang chờ'
          count={pending}
          isActive={active === 'pending'}
          onClick={() => setActive('pending')}
        />

        <QuickStat
          label='Hoàn thành'
          count={done}
          isActive={active === 'done'}
          onClick={() => setActive('done')}
        />
      </div>
    </div>
  );
};

const QuickStat = ({ label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex shrink-0 items-center gap-2 rounded-xl px-4 py-2
      text-xs font-bold transition-all
      ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
      }
    `}
  >
    {label}

    <span
      className={`
        rounded-lg px-1.5 py-0.5 text-[10px]
        ${isActive ? 'bg-white/20' : 'bg-background shadow-sm'}
      `}
    >
      {count}
    </span>
  </button>
);

export default GroceryHeader;
