import React from 'react';
import {
  FaArrowLeft,
  FaCarrot,
  FaClock,
  FaFireAlt,
  FaListOl,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router';

import { useDishesDetail } from '../api/view-dishes-detail';
import DishStat from './dish-stat';

export default function DishDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: dish } = useDishesDetail(id);

  if (!dish) {
    return <div className='p-20 text-center'>Đang tải món ăn...</div>;
  }

  const totalCalories =
    dish.ingredients?.reduce(
      (sum, item) => sum + (item.nutrients?.calories?.value || 0),
      0
    ) || 0;
  const totalTime = (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

  return (
    <div className='mx-auto w-full max-w-7xl space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <button
        onClick={() => navigate(-1)}
        className='group inline-flex items-center gap-3 text-xs font-extrabold tracking-widest text-muted-foreground transition hover:text-primary'
      >
        <span className='flex h-9 w-9 items-center justify-center rounded-full bg-secondary ring-1 ring-border group-hover:bg-primary group-hover:text-white'>
          <FaArrowLeft className='transition-transform group-hover:-translate-x-1' />
        </span>
        QUAY LẠI
      </button>

      <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
        <div className='relative group mx-auto w-[72%]'>
          <div className='relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.25)]'>
            <img
              src={dish.image || '/placeholder.png'}
              alt={dish.name}
              className='h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.02]'
            />
          </div>
        </div>

        <div className='flex flex-col gap-12'>
          <div className='space-y-6'>
            {dish.tags?.length > 0 && (
              <div className='flex flex-wrap gap-3'>
                {dish.tags.map(tag => (
                  <span
                    key={tag}
                    className='text-xl font-black uppercase tracking-[0.25em] text-orange-600/70'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className='text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl'>
              {dish.name}
            </h1>

            <p className='max-w-xl text-lg font-light italic leading-relaxed text-muted-foreground'>
              “{dish.description}”
            </p>
          </div>

          <div className='grid grid-cols-3 gap-6'>
            <DishStat
              icon={<FaFireAlt />}
              label='Năng lượng'
              value={`${totalCalories} kcal`}
              color='orange'
            />
            <DishStat
              icon={<FaClock />}
              label='Thời gian'
              value={`${totalTime} phút`}
              color='emerald'
            />
            <DishStat
              icon={<FaUtensils />}
              label='Khẩu phần'
              value={`${dish.servings} người`}
              color='sky'
            />
          </div>

          <Link
            to={`/dishes/${id}/nutrition`}
            className='inline-flex items-center justify-center gap-3
    rounded-2xl bg-primary px-6 py-4
    text-sm font-black tracking-widest text-primary-foreground
    shadow-lg shadow-primary/30
    hover:brightness-110 active:scale-[0.98]
    transition-all'
          >
            XEM CHI TIẾT DINH DƯỠNG
            <FaFireAlt />
          </Link>

          <div className='flex items-center gap-4 border-t border-border pt-6'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-secondary ring-1 ring-border'>
              <FaUser className='text-muted-foreground' />
            </div>
            <div>
              <p className='text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground'>
                Công thức bởi
              </p>
              <p className='font-bold'>{dish.user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='space-y-20'>
        {/* ingredient */}
        <div className='space-y-8'>
          <div className='flex items-center justify-between border-b border-border pb-4'>
            <h2 className='flex items-center gap-3 text-2xl font-bold'>
              <FaCarrot className='text-orange-500' />
              Nguyên liệu
            </h2>
            <span className='rounded-lg bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground'>
              {dish.ingredients.length}
            </span>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            {dish.ingredients.map(item => (
              <Link
                key={item._id}
                to={`/ingredients/${item.ingredientId}`}
                className='group flex items-center gap-4 rounded-2xl
    border border-border
    bg-background p-4
    transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-lg hover:border-orange-200'
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className='h-14 w-14 rounded-xl object-cover transition-transform duration-300 group-hover:scale-110'
                />

                <div className='flex-1'>
                  <p className='font-bold text-sm text-foreground'>
                    {item.name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {item.baseUnit.amount} {item.baseUnit.unit}
                  </p>
                </div>

                <span className='text-xs font-black text-orange-600'>
                  {item.nutrients.calories.value} kcal
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* instructions */}
        <div className='space-y-10'>
          <h2 className='flex items-center gap-3 border-b border-border pb-4 text-2xl font-bold'>
            <FaListOl className='text-sky-600' />
            Cách chế biến
          </h2>

          <div className='relative space-y-12 before:absolute before:left-[1.125rem] before:top-2 before:h-full before:w-px before:bg-gradient-to-b before:from-sky-200 before:to-transparent'>
            {dish.instructions.map((step, idx) => (
              <div key={step._id} className='relative flex gap-8'>
                <div className='relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-black text-sky-600 ring-4 ring-sky-50'>
                  {idx + 1}
                </div>

                <div className='flex-1 rounded-3xl border border-border bg-background p-6 shadow-sm'>
                  <p className='leading-relaxed font-medium'>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
