import React, { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineAdjustments,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiPlus
} from 'react-icons/hi';
import { IoFilterOutline } from 'react-icons/io5';

import CreateGroceryModal from '../../create-grocery/components/create-grocery-modal';
import { useGroceries } from '../api/view-grocery';

const GroceryHeader = ({ filters, onFilterChange }) => {
  const [openModal, setOpenModal] = useState(false);
  const [nameInput, setNameInput] = useState(filters?.name ?? '');

  const { data } = useGroceries(filters, 1);
  const lists = data?.docs ?? [];
  const active = filters?.status ?? 'all';

  const filteredLists = useMemo(() => {
    if (active === 'done') {
      return lists.filter(
        l => l.ingredients.length && l.ingredients.every(i => i.isPurchased)
      );
    }

    if (active === 'pending') {
      return lists.filter(
        l => !l.ingredients.length || l.ingredients.some(i => !i.isPurchased)
      );
    }

    return lists;
  }, [lists, active]);

  useEffect(() => {
    setNameInput(filters?.name ?? '');
  }, [filters?.name]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange?.({ name: nameInput.trim() });
    }, 350);

    return () => clearTimeout(timeout);
  }, [nameInput, onFilterChange]);

  const total = lists.length;
  const done = lists.filter(
    l => l.ingredients.length && l.ingredients.every(i => i.isPurchased)
  ).length;

  const pending = total - done;

  return (
    <div className='mb-10 space-y-6'>
      <div className='relative overflow-hidden rounded-[32px] border border-border/50 bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)]'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent pointer-events-none' />
        <div className='absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none' />
        <div className='absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl pointer-events-none' />

        <div className='relative p-6 sm:p-8 space-y-6'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
            <div className='max-w-2xl'>
              <h1 className='text-3xl sm:text-4xl font-black tracking-tight leading-tight text-foreground'>
                Giỏ hàng <span className='text-primary'>thông minh</span>
              </h1>

              <p className='mt-2 text-sm sm:text-[15px] font-medium text-muted-foreground max-w-xl leading-relaxed'>
                Quản lý nguyên liệu, theo dõi tiến độ mua sắm và tối ưu dinh
                dưỡng cùng EatDee
              </p>
            </div>

            <>
              <button
                onClick={() => setOpenModal(true)}
                className='group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/35 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30'
              >
                <span className='flex h-6 w-6 items-center justify-center rounded-full bg-white/15'>
                  <HiPlus className='text-lg transition-transform duration-300 group-hover:rotate-90' />
                </span>
                <span>Tạo danh sách mới</span>
              </button>

              <CreateGroceryModal
                open={openModal}
                onClose={() => setOpenModal(false)}
              />
            </>
          </div>

          <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]'>
            <div className='relative'>
              <HiOutlineSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground/50' />

              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder='Tìm kiếm danh sách đi chợ...'
                className='w-full rounded-2xl border border-border/50 bg-background/70 px-12 py-3.5 text-sm font-medium shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10'
              />
            </div>

            <div className='flex gap-2'>
              <button className='inline-flex items-center justify-center gap-2 rounded-2xl border border-border/50 bg-background/70 px-5 py-3.5 text-sm font-bold text-foreground/70 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted whitespace-nowrap'>
                <IoFilterOutline className='text-lg' />
                Lọc
              </button>

              <button
                onClick={() =>
                  onFilterChange?.({
                    sort:
                      filters?.sort === '-createdAt'
                        ? 'createdAt'
                        : '-createdAt'
                  })
                }
                className='inline-flex items-center justify-center gap-2 rounded-2xl border border-border/50 bg-background/70 px-5 py-3.5 text-sm font-bold text-foreground/70 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted whitespace-nowrap'
              >
                <HiOutlineAdjustments className='text-lg' />
                Sắp xếp
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <QuickStat
              label='Tất cả'
              count={total}
              isActive={active === 'all'}
              onClick={() => onFilterChange?.({ status: 'all' })}
            />

            <QuickStat
              label='Đang chờ'
              count={pending}
              isActive={active === 'pending'}
              onClick={() => onFilterChange?.({ status: 'pending' })}
            />

            <QuickStat
              label='Hoàn thành'
              count={done}
              isActive={active === 'done'}
              onClick={() => onFilterChange?.({ status: 'done' })}
            />
          </div>

          {filteredLists.length !== lists.length && (
            <p className='text-xs font-semibold text-muted-foreground'>
              Đang hiển thị {filteredLists.length}/{lists.length} danh sách theo
              bộ lọc.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
      isActive
        ? 'border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/20'
        : 'border-border/50 bg-background/70 text-foreground hover:-translate-y-0.5 hover:border-primary/20 hover:bg-muted/50'
    }`}
  >
    <div className='flex flex-col'>
      <span
        className={`text-[11px] font-black uppercase tracking-[0.16em] ${
          isActive
            ? 'text-primary-foreground/80'
            : 'text-muted-foreground group-hover:text-foreground/80'
        }`}
      >
        {label}
      </span>

      <span className='mt-1 text-lg font-black'>{count}</span>
    </div>

    <span
      className={`rounded-xl px-2.5 py-1 text-[11px] font-black ${
        isActive
          ? 'bg-white/20 text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      mục
    </span>
  </button>
);

export default GroceryHeader;
