import { OctagonAlert } from 'lucide-react';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { ALLERGEN_GROUPS } from '~/constants/allergen';
import { DIET_OPTIONS } from '~/constants/diet';
import { cn } from '~/lib/utils';

export function StepOneTwoAllergen({ control }) {
  const selectedDietValue = useWatch({
    control,
    name: 'diet'
  });

  const selectedDiet = DIET_OPTIONS.find(d => d.value === selectedDietValue);
  const dietExcludedAllergens = selectedDiet?.excludedAllergens || [];

  return (
    <div className='space-y-6'>
      <title>Dị ứng</title>
      <meta
        name='description'
        content='Chọn các loại thực phẩm bạn bị dị ứng nếu có.'
      />
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Kiêng thực phẩm</h3>
        <p className='text-muted-foreground'>
          Chọn các loại thực phẩm bạn muốn loại bỏ khỏi thực đơn
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-4'>
        <div className='hidden lg:flex lg:w-2/5 flex-col items-center justify-start p-4 pt-20 sticky top-0 h-fit'>
          <div className='relative flex items-center justify-center'>
            <OctagonAlert
              size={180}
              strokeWidth={1}
              className='text-primary relative z-10 opacity-80'
            />
          </div>
        </div>

        <div className='w-full lg:w-3/5'>
          <Controller
            control={control}
            name='allergens'
            render={({ field }) => {
              const currentValues = field.value || [];

              const toggleAllergen = allergenValue => {
                if (currentValues.includes(allergenValue)) {
                  field.onChange(
                    currentValues.filter(v => v !== allergenValue)
                  );
                } else {
                  field.onChange([...currentValues, allergenValue]);
                }
              };

              return (
                <FormItem>
                  <FormLabel className='sr-only'>Kiêng thực phẩm</FormLabel>
                  <FormControl>
                    <div className='space-y-6'>
                      {(() => {
                        const commonGroup = ALLERGEN_GROUPS[0];
                        const { excluded, selectable } =
                          commonGroup.options.reduce(
                            (acc, option) => {
                              if (
                                dietExcludedAllergens.includes(option.value)
                              ) {
                                acc.excluded.push(option);
                              } else {
                                acc.selectable.push(option);
                              }
                              return acc;
                            },
                            { excluded: [], selectable: [] }
                          );

                        return (
                          <>
                            {excluded.length > 0 && (
                              <div className='space-y-3'>
                                <h4 className='text-lg font-medium text-primary flex items-center gap-2'>
                                  Đã loại bỏ theo chế độ ăn{' '}
                                  {selectedDiet?.label}
                                </h4>
                                <div className='flex flex-wrap gap-2'>
                                  {excluded.map(option => (
                                    <button
                                      key={option.value}
                                      type='button'
                                      disabled
                                      className={cn(
                                        'relative flex items-center justify-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-200',
                                        'border border-primary/20 bg-primary/5 text-primary opacity-80 cursor-not-allowed'
                                      )}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className='space-y-3'>
                              <h4 className='text-lg font-medium text-muted-foreground'>
                                {excluded.length > 0
                                  ? 'Chọn thêm các thực phẩm khác để kiêng'
                                  : 'Các thực phẩm dễ gây dị ứng phổ biến'}
                              </h4>
                              <div className='flex flex-wrap gap-2'>
                                {selectable.map(option => {
                                  const isSelected = currentValues.includes(
                                    option.value
                                  );
                                  return (
                                    <button
                                      key={option.value}
                                      type='button'
                                      onClick={() =>
                                        toggleAllergen(option.value)
                                      }
                                      className={cn(
                                        'relative flex items-center justify-center px-4 py-2 rounded-lg border text-base font-medium transition-all duration-200',
                                        isSelected
                                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                          : 'border-transparent bg-secondary/50 text-foreground hover:bg-secondary/80 hover:border-border/50'
                                      )}
                                    >
                                      {option.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
