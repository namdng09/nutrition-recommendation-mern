import { FaPlus, FaTag, FaTrash, FaWeightHanging } from 'react-icons/fa';

import EmptyIngredientsState from './empty-ingredients-state';

export default function CreatePrivateDishSelectedIngredients({
  SectionCard,
  FieldLabel,
  TextInput,
  selectedIngredientsDetail,
  getNutrientValue,
  removeIngredient,
  handleQuantityChange,
  onOpenIngredientModal
}) {
  return (
    <SectionCard
      title='Nguyên liệu đã chọn'
      description='Thêm nguyên liệu từ thư viện có sẵn, sau đó chỉnh số lượng theo gram.'
      rightAction={
        <button
          type='button'
          onClick={onOpenIngredientModal}
          className='inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:opacity-90'
        >
          <FaPlus className='text-xs' />
          Thêm nguyên liệu
        </button>
      }
    >
      {selectedIngredientsDetail.length === 0 ? (
        <EmptyIngredientsState />
      ) : (
        <div className='grid grid-cols-1 gap-5 2xl:grid-cols-2'>
          {selectedIngredientsDetail.map((ingredient, index) => {
            const energy = getNutrientValue(
              ingredient.detail?.nutrition,
              'Năng lượng'
            );
            const protein = getNutrientValue(
              ingredient.detail?.nutrition,
              'Protein'
            );
            const fat = getNutrientValue(
              ingredient.detail?.nutrition,
              'Chất béo'
            );
            const carb = getNutrientValue(
              ingredient.detail?.nutrition,
              'Tinh bột'
            );

            return (
              <div
                key={ingredient.ingredientId}
                className='group overflow-hidden rounded-[30px] border border-border/70 bg-gradient-to-br from-card via-card to-accent/20 p-5 text-card-foreground shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]'
              >
                <div className='flex flex-col gap-5'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex min-w-0 items-start gap-4'>
                      <div className='relative shrink-0'>
                        <img
                          src={ingredient.detail?.image}
                          alt={ingredient.detail?.name || 'ingredient'}
                          className='h-24 w-24 rounded-[24px] border border-border bg-muted object-cover shadow-sm'
                        />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-start gap-3'>
                          <div className='min-w-0 flex-1'>
                            <h3 className='truncate text-lg font-black tracking-tight text-foreground md:text-xl'>
                              {ingredient.detail?.name || 'Nguyên liệu'}
                            </h3>
                          </div>
                        </div>

                        {(ingredient.detail?.categories || []).length > 0 ? (
                          <div className='mt-3 flex flex-wrap gap-2'>
                            {(ingredient.detail?.categories || []).map(
                              category => (
                                <span
                                  key={category}
                                  className='inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-bold text-foreground shadow-sm'
                                >
                                  <FaTag className='text-[10px] opacity-70' />
                                  {category}
                                </span>
                              )
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={() => removeIngredient(index)}
                      className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-sm transition hover:scale-[1.03] hover:bg-destructive/15'
                    >
                      <FaTrash className='text-sm' />
                    </button>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    {energy ? (
                      <div className='rounded-2xl border border-orange-500/15 bg-orange-500/10 px-4 py-4'>
                        <div className='flex items-center justify-between gap-4'>
                          <p className='text-left text-[11px] font-bold uppercase leading-[1.15] tracking-wide text-orange-700 dark:text-orange-300'>
                            {energy.label}
                          </p>
                          <p className='text-right text-[15px] font-black leading-none text-foreground'>
                            {energy.value} {energy.unit}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {protein ? (
                      <div className='rounded-2xl border border-blue-500/15 bg-blue-500/10 px-4 py-4'>
                        <div className='flex items-center justify-between gap-4'>
                          <p className='text-left text-[11px] font-bold uppercase leading-[1.15] tracking-wide text-blue-700 dark:text-blue-300'>
                            {protein.label}
                          </p>
                          <p className='text-right text-[15px] font-black leading-none text-foreground'>
                            {protein.value} {protein.unit}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {fat ? (
                      <div className='rounded-2xl border border-pink-500/15 bg-pink-500/10 px-4 py-4'>
                        <div className='flex items-center justify-between gap-4'>
                          <p className='text-left text-[11px] font-bold uppercase leading-[1.15] tracking-wide text-pink-700 dark:text-pink-300'>
                            {fat.label}
                          </p>
                          <p className='text-right text-[15px] font-black leading-none text-foreground'>
                            {fat.value} {fat.unit}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {carb ? (
                      <div className='rounded-2xl border border-violet-500/15 bg-violet-500/10 px-4 py-4'>
                        <div className='flex items-center justify-between gap-4'>
                          <p className='text-left text-[11px] font-bold uppercase leading-[1.15] tracking-wide text-violet-700 dark:text-violet-300'>
                            {carb.label}
                          </p>
                          <p className='text-right text-[15px] font-black leading-none text-foreground'>
                            {carb.value} {carb.unit}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className='rounded-[24px] border border-border/70 bg-background/80 p-4 backdrop-blur-sm'>
                    <FieldLabel>Số lượng (g)</FieldLabel>

                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                      <div className='relative flex-1'>
                        <FaWeightHanging className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                        <TextInput
                          type='number'
                          value={ingredient.units?.[0]?.quantity || 1}
                          onChange={e =>
                            handleQuantityChange(index, e.target.value)
                          }
                          className='h-12 rounded-2xl border-border/80 bg-background pl-11'
                        />
                      </div>

                      <div className='inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-bold text-foreground'>
                        gram
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
