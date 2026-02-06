import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { DISH_CATEGORY_OPTIONS } from '~/constants/dish-category';
import { MEAL_SIZE_OPTIONS } from '~/constants/meal-size';
import { cn } from '~/lib/utils';

export function StepThreeXMealDetail({ control, mealIndex, onBack }) {
  const mealName = useWatch({
    control,
    name: `mealSettings.${mealIndex}.name`
  });

  if (mealIndex === null || mealIndex === undefined) {
    return null;
  }

  return (
    <div key={`meal-detail-${mealIndex}`} className='space-y-6'>
      <title>{mealName ? mealName : 'Chi tiết bữa ăn'}</title>
      <meta
        name='description'
        content={
          mealName
            ? 'Chi tiết ' + mealName + ' và sở thích.'
            : 'Chi tiết món ăn và sở thích cho từng bữa ăn.'
        }
      />
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Chi tiết {mealName}</h3>
      </div>

      <FormField
        control={control}
        name={`mealSettings.${mealIndex}.mealSize`}
        render={({ field }) => (
          <FormItem className='flex items-center gap-4 space-y-0'>
            <FormLabel className='min-w-[120px]'>
              Khẩu phần <span className='text-destructive'>*</span>
            </FormLabel>
            <div className='flex-1'>
              <FormControl>
                <Select
                  key={`meal-size-${mealIndex}`}
                  onValueChange={field.onChange}
                  value={field.value || ''}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn khẩu phần' />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_SIZE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <Controller
        control={control}
        name={`mealSettings.${mealIndex}.dishCategories`}
        render={({ field, fieldState }) => {
          const selectedValues = field.value || [];

          const handleToggle = value => {
            if (selectedValues.includes(value)) {
              field.onChange(selectedValues.filter(v => v !== value));
            } else {
              field.onChange([...selectedValues, value]);
            }
          };

          return (
            <FormItem>
              <FormLabel>
                Danh mục món ăn <span className='text-destructive'>*</span>
              </FormLabel>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
                {DISH_CATEGORY_OPTIONS.map(option => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type='button'
                      onClick={() => handleToggle(option.value)}
                      className={cn(
                        'relative flex h-auto flex-col items-center justify-start rounded-xl border-2 p-2 transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-transparent bg-secondary/30 hover:border-primary/20 hover:bg-secondary/60'
                      )}
                    >
                      <div className='bg-background aspect-square relative mb-2 w-full shrink-0 overflow-hidden rounded-lg shadow-sm'>
                        <img
                          src={option.image}
                          alt={option.label}
                          className='h-full w-full object-cover'
                        />
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium text-center leading-tight w-full px-1',
                          isSelected ? 'text-primary' : 'text-foreground/80'
                        )}
                        style={{ textWrap: 'pretty' }}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {fieldState.error && (
                <p className='text-destructive text-sm'>
                  {fieldState.error.message}
                </p>
              )}
            </FormItem>
          );
        }}
      />

      <Button type='button' variant='secondary' onClick={onBack}>
        Quay lại danh sách
      </Button>
    </div>
  );
}
