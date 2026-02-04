import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  PlusIcon,
  Trash2
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { AVAILABLE_TIME } from '~/constants/available-time';
import { COOKING_PREFERENCE } from '~/constants/cooking-preference';
import { DISH_CATEGORY } from '~/constants/dish-category';
import { MEAL_COMPLEXITY } from '~/constants/meal-complexity';
import { MEAL_SIZE } from '~/constants/meal-size';
import { MEAL_TYPE, MEAL_TYPE_OPTIONS } from '~/constants/meal-type';

function getMealDefaults(mealType) {
  const baseDefaults = {
    name: mealType,
    mealSize: MEAL_SIZE.NORMAL,
    availableTime: AVAILABLE_TIME.SOME_TIME,
    cookingPreference: COOKING_PREFERENCE.CAN_COOK,
    complexity: MEAL_COMPLEXITY.SIMPLE
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

export function StepThreeOneSchedule({ control }) {
  const { fields, append, remove, replace, move } = useFieldArray({
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
        <h3 className='text-3xl font-bold'>Lịch bữa ăn</h3>
        <p className='text-muted-foreground'>
          Quản lý các bữa ăn hàng ngày của bạn
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left Column - Icon */}
        <div className='hidden lg:flex lg:w-2/5 flex-col items-center justify-start p-4 pt-20 sticky top-0 h-fit'>
          <div className='relative flex items-center justify-center'>
            <CalendarClock
              size={180}
              strokeWidth={1}
              className='text-primary relative z-10 opacity-80'
            />
          </div>
        </div>

        {/* Right Column - Form */}
        <div className='w-full lg:w-3/5 space-y-6'>
          <div className='space-y-4'>
            <div className='space-y-3'>
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className='border-input relative flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center'
                  >
                    <div className='flex-1 space-y-2'>
                      <Controller
                        control={control}
                        name={`mealSettings.${index}.name`}
                        render={({ field: inputField }) => (
                          <Input
                            placeholder='Tên bữa ăn'
                            {...inputField}
                            className='font-medium'
                          />
                        )}
                      />
                    </div>

                    <div className='flex items-center gap-1'>
                      <div className='flex items-center'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}
                        >
                          <ChevronUp className='size-4' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          disabled={index === fields.length - 1}
                          onClick={() => move(index, index + 1)}
                        >
                          <ChevronDown className='size-4' />
                        </Button>
                      </div>

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => remove(index)}
                        className='text-destructive hover:text-destructive'
                      >
                        <Trash2 className='size-4' />
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
                  mealSize: MEAL_SIZE.NORMAL,
                  availableTime: AVAILABLE_TIME.SOME_TIME,
                  cookingPreference: COOKING_PREFERENCE.CAN_COOK,
                  complexity: MEAL_COMPLEXITY.SIMPLE
                })
              }
            >
              <PlusIcon />
              Thêm bữa ăn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
