import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { FaFireAlt } from 'react-icons/fa';
import { GiCottonFlower, GiMeat, GiOlive, GiWheat } from 'react-icons/gi';
import { Link, useNavigate, useParams } from 'react-router';

import { Button } from '~/components/ui/button';

import { useIngredientDetail } from '../api/view-ingredient-detail';
import IngredientNutritionPie from './ingredient-nutrition-pie';

export default function IngredientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useIngredientDetail(id);

  const item = data;

  return (
    <div className='mx-auto w-full max-w-8xl space-y-5'>
      <div className='flex items-center justify-between gap-3'>
        <Button
          variant='ghost'
          className='rounded-xl'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>

        <div className='text-sm'>
          <span className='inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 font-medium text-accent-foreground'>
            {item?.category}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start'>
        <div className='rounded-2xl border border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-5 shadow-sm'>
          <div className='flex flex-col gap-5 md:flex-row md:items-start'>
            <div className='h-44 w-full overflow-hidden rounded-2xl border border-border bg-muted md:h-56 md:w-56'>
              <img
                src={item?.image || '/placeholder.png'}
                alt={item?.name}
                className='h-full w-full object-cover'
                loading='lazy'
              />
            </div>

            <div className='min-w-0 flex-1 space-y-4'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h1 className='truncate text-2xl font-bold text-foreground'>
                    {item?.name}
                  </h1>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {item?.category} • {item?.unit}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    item?.isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item?.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>

              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                <div className='group rounded-xl border border-border bg-gradient-to-br from-orange-50/70 to-background p-3 transition hover:-translate-y-0.5 hover:shadow-md'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 ring-1 ring-orange-500/15'>
                      <FaFireAlt className='h-4 w-4 text-orange-600' />
                    </span>
                    Calo / 100g
                  </div>
                  <div className='mt-2 text-2xl font-bold tracking-tight text-foreground'>
                    {item?.caloriesPer100g ?? 0}
                  </div>
                </div>

                <div className='group rounded-xl border border-border bg-gradient-to-br from-emerald-50/70 to-background p-3 transition hover:-translate-y-0.5 hover:shadow-md'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/15'>
                      <GiMeat className='h-4 w-4 text-emerald-600' />
                    </span>
                    Đạm (Protein)
                  </div>
                  <div className='mt-2 text-2xl font-bold tracking-tight text-foreground'>
                    {item?.protein ?? 0}g
                  </div>
                </div>

                <div className='group rounded-xl border border-border bg-gradient-to-br from-sky-50/70 to-background p-3 transition hover:-translate-y-0.5 hover:shadow-md'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/15'>
                      <GiWheat className='h-4 w-4 text-sky-600' />
                    </span>
                    Tinh bột (Carbs)
                  </div>
                  <div className='mt-2 text-2xl font-bold tracking-tight text-foreground'>
                    {item?.carbs ?? 0}g
                  </div>
                </div>

                <div className='group rounded-xl border border-border bg-gradient-to-br from-fuchsia-50/70 to-background p-3 transition hover:-translate-y-0.5 hover:shadow-md'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-500/10 ring-1 ring-fuchsia-500/15'>
                      <GiOlive className='h-4 w-4 text-fuchsia-600' />
                    </span>
                    Chất béo (Fat)
                  </div>
                  <div className='mt-2 text-2xl font-bold tracking-tight text-foreground'>
                    {item?.fat ?? 0}g
                  </div>
                </div>

                <div className='group rounded-xl border border-border bg-gradient-to-br from-violet-50/70 to-background p-3 transition hover:-translate-y-0.5 hover:shadow-md'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/15'>
                      <GiCottonFlower className='h-4 w-4 text-violet-600' />
                    </span>
                    Chất xơ (Fiber)
                  </div>
                  <div className='mt-2 text-2xl font-bold tracking-tight text-foreground'>
                    {item?.fiber ?? 0}g
                  </div>
                </div>
              </div>

              <div className='rounded-xl border border-border p-3'>
                <div className='text-sm font-semibold text-foreground'>
                  Chất gây dị ứng
                </div>
                <div className='mt-2 text-sm text-muted-foreground'>
                  {item?.allergens?.length ? (
                    <div className='flex flex-wrap gap-2'>
                      {item.allergens.map(a => (
                        <span
                          key={a}
                          className='rounded-full bg-muted px-2 py-1 text-xs'
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'Không có'
                  )}
                </div>
              </div>

              <div className='pt-1'>
                <Link
                  to='/ingredients'
                  className='text-sm font-medium text-primary hover:underline underline-offset-4'
                >
                  Trở về danh sách nguyên liệu
                </Link>
              </div>
            </div>
          </div>
        </div>

        <IngredientNutritionPie item={item} />
      </div>
    </div>
  );
}
