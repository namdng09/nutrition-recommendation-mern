import { FaAlignLeft, FaBox, FaTag } from 'react-icons/fa';
import { IoChevronForward } from 'react-icons/io5';
import { Link } from 'react-router';

import { Button } from '~/components/ui/button';

import NutritionDetailGrid from './nutrition-detail-grid';

export default function IngredientMainInfo({
  item,
  defaultUnit,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sodium,
  setOpenNutrition
}) {
  return (
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

          <NutritionDetailGrid
            item={item}
            calories={calories}
            protein={protein}
            carbs={carbs}
            fat={fat}
            fiber={fiber}
            sodium={sodium}
          />

          <Button
            variant='outline'
            className='w-fit rounded-xl text-sm flex items-center gap-2'
            onClick={() => setOpenNutrition(true)}
          >
            Xem chi tiết dinh dưỡng
            <IoChevronForward size={16} className='text-muted-foreground' />
          </Button>

          {/* UNITS */}
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

          {/* ALLERGENS */}
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

          {/* BACK LINK */}
          <Link
            to='/ingredients'
            className='text-sm font-medium text-primary hover:underline'
          >
            Trở về danh sách nguyên liệu
          </Link>
        </div>
      </div>
    </div>
  );
}
