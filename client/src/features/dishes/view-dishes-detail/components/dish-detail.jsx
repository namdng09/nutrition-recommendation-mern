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

import DishFavoriteDetailButton from '../../add-dish-to-favorite/components/dish-favorite-detail-button';
import BlockToggleDishButton from '../../block-dish/components/block-toggle-dish-button';
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
    dish?.nutrition?.nutrients?.find(n => n.label === 'Năng lượng')?.value ?? 0;

  const totalTime = (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

  return (
    <div className='mx-auto w-full max-w-7xl animate-in space-y-16 px-4 pb-6 fade-in slide-in-from-bottom-4 duration-700 sm:px-6 lg:px-0'>
      <div className='flex items-center justify-between'>
        <button
          onClick={() => navigate(-1)}
          className='group inline-flex items-center gap-3 rounded-full bg-muted/50 px-3 py-2 text-xs font-extrabold tracking-[0.18em] text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary'
        >
          <span className='flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border transition-all group-hover:bg-primary group-hover:text-primary-foreground'>
            <FaArrowLeft className='transition-transform duration-300 group-hover:-translate-x-1' />
          </span>
          QUAY LẠI
        </button>

        <div className='flex items-center gap-2'>
          <DishFavoriteDetailButton dishId={dish._id} />
          <BlockToggleDishButton dishId={dish._id} />
        </div>
      </div>

      <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
        <div className='group relative mx-auto w-full max-w-[430px]'>
          <div className='relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-card shadow-[0_20px_60px_rgba(0,0,0,0.10)] ring-1 ring-border/50'>
            <img
              src={dish.image || '/placeholder.png'}
              alt={dish.name}
              className='h-full w-full object-cover transition-transform'
            />
          </div>
        </div>

        <div className='flex flex-col gap-10'>
          <div className='space-y-6'>
            {dish.tags?.length > 0 && (
              <div className='flex flex-wrap gap-2.5'>
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

            <h1 className='text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl'>
              {dish.name}
            </h1>

            {dish.description && (
              <p className='max-w-xl text-base italic leading-relaxed text-muted-foreground sm:text-lg'>
                “{dish.description}”
              </p>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
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
              value={`${dish.servings ?? 0} người`}
              color='sky'
            />
          </div>

          <Link
            to={`/dishes/${id}/nutrition`}
            className='inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-sm font-black tracking-[0.16em] text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-primary/35 active:scale-[0.98]'
          >
            XEM CHI TIẾT DINH DƯỠNG
            <FaFireAlt />
          </Link>

          {dish.user && (
            <div className='flex items-center gap-4 rounded-[1.5rem] bg-card p-4 shadow-sm ring-1 ring-border/50'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border'>
                <FaUser className='text-base' />
              </div>
              <div>
                <p className='text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground'>
                  Công thức được tạo bởi
                </p>
                <Link
                  to={`/nutritionists/${dish.user._id}`}
                  className='font-bold hover:underline underline-offset-4'
                >
                  {dish.user.name}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {dish.ingredients?.length > 0 && (
        <div className='space-y-8'>
          <div className='flex items-center justify-between border-b border-border pb-4'>
            <h2 className='flex items-center gap-3 text-2xl font-black tracking-tight text-foreground'>
              <FaCarrot className='text-orange-500' />
              Nguyên liệu
            </h2>
            <span className='rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground'>
              {dish.ingredients.length}
            </span>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            {dish.ingredients.map(item => {
              const unit = item.units?.find(u => u.isDefault);

              return (
                <Link
                  key={item._id}
                  to={`/ingredients/${item.ingredientId}`}
                  className='group flex items-center gap-4 rounded-[1.5rem] bg-card p-4 shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-orange-200 dark:hover:ring-orange-500/20'
                >
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    className='h-14 w-14 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-l font-bold text-foreground'>
                      {item.name}
                    </p>
                    <p className='text-l text-muted-foreground'>
                      {unit?.quantity ?? '-'} {unit?.unit ?? ''}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {dish.instructions?.length > 0 && (
        <div className='space-y-8'>
          <h2 className='flex items-center gap-3 border-b border-border pb-4 text-2xl font-black tracking-tight text-foreground'>
            <FaListOl className='text-sky-600' />
            Cách chế biến
          </h2>

          <div className='relative space-y-8 before:absolute before:left-[1.1rem] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-sky-300/70 before:to-transparent dark:before:from-sky-500/40'>
            {dish.instructions.map((step, idx) => (
              <div key={step._id} className='relative flex gap-6'>
                <div className='relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-black text-sky-600 shadow-sm ring-4 ring-sky-50 dark:ring-sky-500/10'>
                  {idx + 1}
                </div>

                <div className='flex-1 rounded-[1.75rem] bg-card p-6 shadow-sm ring-1 ring-border/50'>
                  <p className='font-medium leading-relaxed text-foreground/90'>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
