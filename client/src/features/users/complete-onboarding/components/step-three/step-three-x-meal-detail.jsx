import React from 'react';
import { Controller } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue
} from '~/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { DISH_CATEGORY_OPTIONS } from '~/constants/dish-category';
import { MEAL_SIZE_OPTIONS } from '~/constants/meal-size';
import { MEAL_TYPE_OPTIONS } from '~/constants/meal-type';

export function StepThreeXMealDetail({ control, mealIndex, onBack }) {
  if (mealIndex === null || mealIndex === undefined) {
    return null;
  }

  return (
    <div key={`meal-detail-${mealIndex}`} className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Chi tiết bữa ăn</h3>
        <p className='text-muted-foreground text-sm'>
          Cấu hình chi tiết cho bữa ăn này
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={control}
          name={`mealSettings.${mealIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên bữa ăn <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Nhập tên bữa ăn'
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`mealSettings.${mealIndex}.mealSize`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Khẩu phần <span className='text-destructive'>*</span>
              </FormLabel>
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
            </FormItem>
          )}
        />
      </div>

      <Controller
        control={control}
        name={`mealSettings.${mealIndex}.dishCategories`}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>
              Danh mục món ăn <span className='text-destructive'>*</span>
            </FormLabel>
            <MultiSelect
              values={field.value || []}
              onValuesChange={field.onChange}
            >
              <FormControl>
                <MultiSelectTrigger className='w-full'>
                  <MultiSelectValue placeholder='Chọn danh mục món ăn' />
                </MultiSelectTrigger>
              </FormControl>
              <MultiSelectContent>
                {DISH_CATEGORY_OPTIONS.map(option => (
                  <MultiSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </MultiSelectItem>
                ))}
              </MultiSelectContent>
            </MultiSelect>
            {fieldState.error && (
              <p className='text-destructive text-sm'>
                {fieldState.error.message}
              </p>
            )}
          </FormItem>
        )}
      />

      <Button type='button' variant='secondary' onClick={onBack}>
        Quay lại danh sách
      </Button>
    </div>
  );
}
