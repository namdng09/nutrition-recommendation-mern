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
import {
  AVAILABLE_TIME,
  AVAILABLE_TIME_OPTIONS
} from '~/constants/available-time';
import {
  COOKING_PREFERENCE,
  COOKING_PREFERENCE_OPTIONS
} from '~/constants/cooking-preference';
import {
  DISH_CATEGORY,
  DISH_CATEGORY_OPTIONS
} from '~/constants/dish-category';
import {
  MEAL_COMPLEXITY,
  MEAL_COMPLEXITY_OPTIONS
} from '~/constants/meal-complexity';
import { MEAL_SIZE, MEAL_SIZE_OPTIONS } from '~/constants/meal-size';
import { MEAL_TYPE, MEAL_TYPE_OPTIONS } from '~/constants/meal-type';
import { USER_TARGET_OPTIONS } from '~/constants/user-target';

function MealSettingFields({ control, index }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <FormField
        control={control}
        name={`mealSettings.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Loại bữa ăn <span className='text-destructive'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn loại bữa ăn' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MEAL_TYPE_OPTIONS.map(option => (
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

      <Controller
        control={control}
        name={`mealSettings.${index}.dishCategories`}
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

      <FormField
        control={control}
        name={`mealSettings.${index}.cookingPreference`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Sở thích nấu ăn <span className='text-destructive'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn sở thích nấu ăn' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {COOKING_PREFERENCE_OPTIONS.map(option => (
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

      <FormField
        control={control}
        name={`mealSettings.${index}.mealSize`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Kích thước bữa ăn <span className='text-destructive'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn kích thước' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MEAL_SIZE_OPTIONS.map(option => (
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

      <FormField
        control={control}
        name={`mealSettings.${index}.availableTime`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Thời gian sẵn có <span className='text-destructive'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn thời gian' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {AVAILABLE_TIME_OPTIONS.map(option => (
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

      <FormField
        control={control}
        name={`mealSettings.${index}.complexity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Độ phức tạp <span className='text-destructive'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn độ phức tạp' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MEAL_COMPLEXITY_OPTIONS.map(option => (
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
    </div>
  );
}

// Helper function to get default values for each meal type
function getMealDefaults(mealType) {
  const baseDefaults = {
    name: mealType,
    cookingPreference: COOKING_PREFERENCE.CAN_COOK,
    mealSize: MEAL_SIZE.NORMAL,
    availableTime: AVAILABLE_TIME.SOME_TIME,
    complexity: MEAL_COMPLEXITY.MODERATE
  };

  // Define dish categories based on meal type
  const dishCategoriesByMealType = {
    [MEAL_TYPE.BREAKFAST]: [DISH_CATEGORY.BREAKFAST, DISH_CATEGORY.BEVERAGE],
    [MEAL_TYPE.LUNCH]: [
      DISH_CATEGORY.MAIN_COURSE,
      DISH_CATEGORY.SOUP,
      DISH_CATEGORY.SIDE_DISH
    ],
    [MEAL_TYPE.DINNER]: [
      DISH_CATEGORY.MAIN_COURSE,
      DISH_CATEGORY.SOUP,
      DISH_CATEGORY.SALAD
    ],
    [MEAL_TYPE.SNACK]: [DISH_CATEGORY.SNACK, DISH_CATEGORY.BEVERAGE],
    [MEAL_TYPE.DESSERT]: [DISH_CATEGORY.DESSERT, DISH_CATEGORY.BEVERAGE]
  };

  return {
    ...baseDefaults,
    dishCategories: dishCategoriesByMealType[mealType] || []
  };
}

export function StepThreeGoals({ control, watch }) {
  const [showExactGoal, setShowExactGoal] = useState(false);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'mealSettings'
  });

  useEffect(() => {
    if (fields.length === 0) {
      const defaultMeals = MEAL_TYPE_OPTIONS.map(option =>
        getMealDefaults(option.value)
      );
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

      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>
          Các bữa ăn hàng ngày (Đã thiết lập mặc định)
        </h4>

        <p className='text-muted-foreground text-xs'>
          Các bữa ăn mặc định đã được thiết lập sẵn. Bạn có thể chỉnh sửa hoặc
          thêm bữa ăn mới.
        </p>

        <div className='space-y-4'>
          {fields.map((field, index) => {
            return (
              <div
                key={field.id}
                className='border-input relative rounded-md border p-6 space-y-4'
              >
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-2 top-2'
                  onClick={() => remove(index)}
                >
                  <XIcon />
                </Button>

                <MealSettingFields control={control} index={index} />
              </div>
            );
          })}
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='w-full'
          onClick={() =>
            append({
              name: '',
              dishCategories: [],
              cookingPreference: COOKING_PREFERENCE.CAN_COOK,
              mealSize: MEAL_SIZE.NORMAL,
              availableTime: AVAILABLE_TIME.SOME_TIME,
              complexity: MEAL_COMPLEXITY.MODERATE
            })
          }
        >
          <PlusIcon />
          Thêm bữa ăn
        </Button>
      </div>
    </div>
  );
}
