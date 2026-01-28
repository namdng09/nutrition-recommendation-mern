import { PlusIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { MEAL_TYPE_OPTIONS } from '~/constants/meal-type';
import { USER_TARGET_OPTIONS } from '~/constants/user-target';

export function StepThreeGoals({ control, watch }) {
  const [showExactGoal, setShowExactGoal] = useState(false);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'mealSetting'
  });

  // Initialize with default meals from MEAL_TYPE_OPTIONS
  useEffect(() => {
    if (fields.length === 0) {
      const defaultMeals = MEAL_TYPE_OPTIONS.map(option => ({
        name: option.value,
        categories: [option.label] // Use label as default category
      }));
      replace(defaultMeals);
    }
  }, [fields.length, replace]);

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Mục tiêu & Bữa ăn</h3>
        <p className='text-muted-foreground text-sm'>
          Thiết lập mục tiêu dinh dưỡng và các bữa ăn hàng ngày
        </p>
      </div>

      {/* Goal Selection */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>Mục tiêu của bạn</h4>

        <div className='flex gap-3'>
          <Button
            type='button'
            variant={!showExactGoal ? 'default' : 'outline'}
            onClick={() => setShowExactGoal(false)}
          >
            Mục tiêu chung
          </Button>
          <Button
            type='button'
            variant={showExactGoal ? 'default' : 'outline'}
            onClick={() => setShowExactGoal(true)}
          >
            Mục tiêu cụ thể
          </Button>
        </div>

        {!showExactGoal ? (
          <Controller
            control={control}
            name='goal.target'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mục tiêu</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Chọn mục tiêu của bạn' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_TARGET_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className='space-y-4'>
            <Controller
              control={control}
              name='goal.target'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mục tiêu</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Chọn mục tiêu của bạn' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_TARGET_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <FormField
                control={control}
                name='nutritionTarget.caloriesTarget'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calo mục tiêu</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='2000'
                        className='w-full'
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-2'>
                <FormLabel>Carbs (g)</FormLabel>
                <div className='flex gap-2'>
                  <FormField
                    control={control}
                    name='nutritionTarget.macros.carbs.min'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Min'
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className='mt-2'>-</span>
                  <FormField
                    control={control}
                    name='nutritionTarget.macros.carbs.max'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Max'
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <FormLabel>Protein (g)</FormLabel>
                <div className='flex gap-2'>
                  <FormField
                    control={control}
                    name='nutritionTarget.macros.protein.min'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Min'
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className='mt-2'>-</span>
                  <FormField
                    control={control}
                    name='nutritionTarget.macros.protein.max'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Max'
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <FormLabel>Fat (g)</FormLabel>
                <div className='flex gap-2'>
                  <FormField
                    control={control}
                    name='nutritionTarget.macros.fat.min'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Min'
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className='mt-2'>-</span>
                  <FormField
                    control={control}
                    name='nutritionTarget.macros.fat.max'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Max'
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meal Settings - Pre-populated with defaults */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-medium'>
            Các bữa ăn hàng ngày (Đã thiết lập mặc định)
          </h4>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append({ name: '', categories: [] })}
          >
            <PlusIcon />
            Thêm bữa ăn
          </Button>
        </div>

        <p className='text-muted-foreground text-xs'>
          Các bữa ăn mặc định đã được thiết lập sẵn. Bạn có thể chỉnh sửa danh
          mục hoặc thêm bữa ăn mới.
        </p>

        <div className='space-y-4'>
          {fields.map((field, index) => {
            const mealName = watch(`mealSetting.${index}.name`);
            const selectedMeal = MEAL_TYPE_OPTIONS.find(
              opt => opt.value === mealName
            );

            return (
              <div
                key={field.id}
                className='border-input relative rounded-md border p-4'
              >
                {/* Only show remove button for non-default meals */}
                {index >= MEAL_TYPE_OPTIONS.length && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-2 top-2'
                    onClick={() => remove(index)}
                  >
                    <XIcon />
                  </Button>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  {/* Meal Type Dropdown */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                      Loại bữa ăn <span className='text-destructive'>*</span>
                    </label>
                    <FormField
                      control={control}
                      name={`mealSetting.${index}.name`}
                      render={({ field }) => (
                        <>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Chọn loại bữa ăn' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MEAL_TYPE_OPTIONS.map(option => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </>
                      )}
                    />
                  </div>

                  {/* Categories Input */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                      Danh mục món ăn{' '}
                      <span className='text-destructive'>*</span>
                    </label>
                    <FormField
                      control={control}
                      name={`mealSetting.${index}.categories`}
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <Input
                              className='w-full'
                              placeholder={
                                selectedMeal
                                  ? `Ví dụ: ${selectedMeal.label}, Món phụ...`
                                  : 'Ví dụ: Món chính, Món phụ...'
                              }
                              value={field.value?.join(', ') || ''}
                              onChange={e => {
                                const value = e.target.value;
                                field.onChange(
                                  value
                                    ? value.split(',').map(v => v.trim())
                                    : []
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
