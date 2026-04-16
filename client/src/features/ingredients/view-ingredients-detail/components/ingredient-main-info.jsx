import { FaAlignLeft, FaBox, FaTag } from 'react-icons/fa';
import { IoChevronForward } from 'react-icons/io5';
import { Link } from 'react-router';

import { Button } from '~/components/ui/button';

import FavoriteIngredientDetailButton from '../../add-ingredient-to-fav/components/favorite-ingredient-detail-button';
import BlockToggleIngredientButton from '../../block-ingredient/components/block-toggle-ingredient-button';
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
    <div className='rounded-[2rem] bg-card/90 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.06)] ring-1 ring-border/60 backdrop-blur sm:p-6'>
      <div className='flex flex-col gap-6 lg:flex-row'>
        <div className='h-52 w-full overflow-hidden rounded-[1.5rem] bg-muted shadow-sm ring-1 ring-border/50 md:h-64 md:w-64 lg:shrink-0'>
          <img
            src={item?.image || '/logo2.png'}
            alt={item?.name}
            className='h-full w-full object-cover'
          />
        </div>

        <div className='flex-1 space-y-5'>
          <div className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
            <div className='min-w-0'>
              <h1 className='text-2xl font-black tracking-tight text-foreground sm:text-3xl'>
                {item?.name}
              </h1>

              <div className='mt-3 flex flex-wrap items-center gap-2'>
                {item?.categories?.map(cat => (
                  <span
                    key={cat}
                    className='inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-sm ring-1 ring-border/50'
                  >
                    <FaTag className='h-3.5 w-3.5' />
                    {cat}
                  </span>
                ))}

                {defaultUnit?.unit && (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-sm ring-1 ring-border/50'>
                    <FaBox className='h-3.5 w-3.5' />
                    {defaultUnit.unit}
                  </span>
                )}
              </div>

              {item?.description && (
                <div className='mt-4 rounded-[1.25rem] bg-muted/40 p-4 shadow-sm ring-1 ring-border/40'>
                  <div className='mb-2 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400'>
                    <FaAlignLeft className='h-4 w-4' />
                    Mô tả
                  </div>

                  <p className='text-sm leading-relaxed text-foreground/90'>
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-2 xl:justify-end'>
              <span
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                  item?.isActive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {item?.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </span>

              <FavoriteIngredientDetailButton ingredientId={item._id} />
              <BlockToggleIngredientButton ingredientId={item._id} />
            </div>
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
            className='flex w-fit items-center gap-2 rounded-xl text-sm shadow-sm'
            onClick={() => setOpenNutrition(true)}
          >
            Xem chi tiết dinh dưỡng
            <IoChevronForward size={16} className='text-muted-foreground' />
          </Button>

          <div className='grid gap-4 lg:grid-cols-2'>
            <div className='rounded-[1.25rem] bg-background p-4 shadow-sm ring-1 ring-border/50'>
              <div className='text-sm font-black tracking-tight text-foreground'>
                Đơn vị sử dụng
              </div>

              <div className='mt-3 flex flex-wrap gap-2'>
                {item?.units?.map(u => (
                  <span
                    key={u._id}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
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

            <div className='rounded-[1.25rem] bg-background p-4 shadow-sm ring-1 ring-border/50'>
              <div className='text-sm font-black tracking-tight text-foreground'>
                Chất gây dị ứng
              </div>

              <div className='mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground'>
                {item?.allergens?.length
                  ? item.allergens.map(a => (
                      <span
                        key={a}
                        className='rounded-full bg-muted px-3 py-1.5 text-xs font-medium'
                      >
                        {a}
                      </span>
                    ))
                  : 'Không có'}
              </div>
            </div>
          </div>

          <Link
            to='/ingredients'
            className='inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:translate-x-0.5 hover:underline'
          >
            Trở về danh sách nguyên liệu
          </Link>
        </div>
      </div>
    </div>
  );
}
