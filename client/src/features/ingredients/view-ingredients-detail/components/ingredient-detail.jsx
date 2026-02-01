import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { FaAlignLeft, FaBox, FaFireAlt, FaTag } from 'react-icons/fa';
import {
  GiCottonFlower,
  GiMeat,
  GiOlive,
  GiSaltShaker,
  GiWheat
} from 'react-icons/gi';
import { IoChevronForward } from 'react-icons/io5';
import { Link, useNavigate, useParams } from 'react-router';

import { Button } from '~/components/ui/button';

import { useIngredientDetail } from '../api/view-ingredient-detail';
import IngredientNutritionModal from './ingredient-nutrition-model';
import IngredientNutritionPie from './ingredient-nutrition-pie';
import NutritionStatCard from './nutrition-stat-card';

export default function IngredientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useIngredientDetail(id);

  const item = data;
  const nutrients = item?.nutrition?.nutrients || {};
  const defaultUnit = item?.units?.find(u => u.isDefault) || item?.units?.[0];

  const [openNutrition, setOpenNutrition] = useState(false);

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

        <div className='flex flex-wrap gap-2 text-sm'>
          {item?.categories?.map(c => (
            <span
              key={c}
              className='inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 font-medium text-accent-foreground'
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start'>
        <div className='rounded-2xl border border-border bg-background/80 backdrop-blur p-5 shadow-sm'>
          <div className='flex flex-col gap-5 md:flex-row'>
            <div className='h-44 w-full overflow-hidden rounded-2xl border bg-muted md:h-56 md:w-56'>
              <img
                src={item?.image || '/placeholder.png'}
                alt={item?.name}
                className='h-full w-full object-cover'
              />
            </div>

            <div className='flex-1 space-y-4'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h1 className='truncate text-2xl font-bold text-foreground'>
                    {item?.name}
                  </h1>

                  <div className='mt-1 flex flex-wrap items-center gap-2 text-sm'>
                    {item?.categories?.map(cat => (
                      <span
                        key={cat}
                        className='inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border'
                      >
                        <FaTag className='h-3.5 w-3.5' />
                        {cat}
                      </span>
                    ))}

                    {defaultUnit?.unit && (
                      <span className='inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border'>
                        <FaBox className='h-3.5 w-3.5' />
                        {defaultUnit.unit}
                      </span>
                    )}
                  </div>

                  {item?.description && (
                    <div className='mt-3 w-full rounded-xl border border-border bg-muted/40 p-4'>
                      <div className='mb-1 flex items-center gap-2 text-sm font-medium text-emerald-700'>
                        <FaAlignLeft className='h-4 w-4' />
                        Mô tả
                      </div>
                      <p className='text-sm text-foreground leading-relaxed'>
                        {item.description}
                      </p>
                    </div>
                  )}
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
                <NutritionStatCard
                  icon={<FaFireAlt />}
                  label={`Calo / ${item?.baseUnit?.amount}${item?.baseUnit?.unit}`}
                  value={`${nutrients.calories?.value ?? 0} ${
                    nutrients.calories?.unit ?? ''
                  }`}
                  color='orange'
                />
                <NutritionStatCard
                  icon={<GiMeat />}
                  label='Đạm (Protein)'
                  value={`${nutrients.protein?.value ?? 0}g`}
                  color='emerald'
                />
                <NutritionStatCard
                  icon={<GiWheat />}
                  label='Tinh bột (Carbs)'
                  value={`${nutrients.carbs?.value ?? 0}g`}
                  color='sky'
                />
                <NutritionStatCard
                  icon={<GiOlive />}
                  label='Chất béo (Fat)'
                  value={`${nutrients.fat?.value ?? 0}g`}
                  color='fuchsia'
                />
                <NutritionStatCard
                  icon={<GiCottonFlower />}
                  label='Chất xơ (Fiber)'
                  value={`${nutrients.fiber?.value ?? 0}g`}
                  color='violet'
                />
                <NutritionStatCard
                  icon={<GiSaltShaker />}
                  label='Natri (Sodium)'
                  value={`${nutrients.sodium?.value ?? 0}${
                    nutrients.sodium?.unit ?? ''
                  }`}
                  color='amber'
                />
              </div>

              <Button
                variant='outline'
                className='w-fit rounded-xl text-sm flex items-center gap-2'
                onClick={() => setOpenNutrition(true)}
              >
                Xem chi tiết dinh dưỡng
                <IoChevronForward size={16} className='text-muted-foreground' />
              </Button>

              <div className='rounded-xl border p-3'>
                <div className='text-sm font-semibold'>Đơn vị sử dụng</div>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {item?.units?.map(u => (
                    <span
                      key={u._id}
                      className={`rounded-full px-3 py-1 text-xs ${
                        u.isDefault
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {u.value} {u.unit}
                    </span>
                  ))}
                </div>
              </div>

              <div className='rounded-xl border p-3'>
                <div className='text-sm font-semibold'>Chất gây dị ứng</div>
                <div className='mt-2 text-sm text-muted-foreground'>
                  {item?.allergens?.length
                    ? item.allergens.map(a => (
                        <span
                          key={a}
                          className='mr-2 rounded-full bg-muted px-2 py-1 text-xs'
                        >
                          {a}
                        </span>
                      ))
                    : 'Không có'}
                </div>
              </div>

              <Link
                to='/ingredients'
                className='text-sm font-medium text-primary hover:underline'
              >
                Trở về danh sách nguyên liệu
              </Link>
            </div>
          </div>
        </div>

        <IngredientNutritionPie item={item} />
      </div>

      <IngredientNutritionModal
        open={openNutrition}
        onClose={() => setOpenNutrition(false)}
        nutrition={item?.nutrition}
      />
    </div>
  );
}
