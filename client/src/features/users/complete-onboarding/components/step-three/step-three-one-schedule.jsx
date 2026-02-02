import { PlusIcon, XIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { DISH_CATEGORY } from '~/constants/dish-category';
import { MEAL_SIZE } from '~/constants/meal-size';
import { MEAL_TYPE, MEAL_TYPE_OPTIONS } from '~/constants/meal-type';

function getMealDefaults(mealType) {
  const baseDefaults = {
    name: mealType,
    mealSize: MEAL_SIZE.NORMAL
  };

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

export function StepThreeOneSchedule({ control, onEditMeal }) {
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

  const getMealLabel = mealType => {
    const option = MEAL_TYPE_OPTIONS.find(opt => opt.value === mealType);
    return option ? option.label : mealType;
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Lịch bữa ăn</h3>
        <p className='text-muted-foreground text-sm'>
          Quản lý các bữa ăn hàng ngày của bạn
        </p>
      </div>

      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>
          Các bữa ăn hàng ngày (Đã thiết lập mặc định)
        </h4>

        <p className='text-muted-foreground text-xs'>
          Các bữa ăn mặc định đã được thiết lập sẵn. Bạn có thể chỉnh sửa hoặc
          thêm bữa ăn mới.
        </p>

        <div className='space-y-3'>
          {fields.map((field, index) => {
            return (
              <div
                key={field.id}
                className='border-input relative flex items-center justify-between rounded-md border p-4'
              >
                <div className='flex-1'>
                  <p className='font-medium'>
                    {getMealLabel(field.name) || 'Bữa ăn mới'}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {field.dishCategories?.length || 0} danh mục món ăn
                  </p>
                </div>

                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => onEditMeal && onEditMeal(index)}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => remove(index)}
                  >
                    <XIcon className='size-4' />
                  </Button>
                </div>
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
              mealSize: MEAL_SIZE.NORMAL
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
