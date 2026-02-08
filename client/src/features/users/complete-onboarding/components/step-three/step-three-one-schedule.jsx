import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  PlusIcon,
  Trash2
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { AVAILABLE_TIME } from '~/constants/available-time';
import { COOKING_PREFERENCE } from '~/constants/cooking-preference';
import { DISH_CATEGORY } from '~/constants/dish-category';
import { MEAL_COMPLEXITY } from '~/constants/meal-complexity';
import { MEAL_SIZE } from '~/constants/meal-size';
import { MEAL_TYPE } from '~/constants/meal-type';

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

  const mealSizeByType = {
    [MEAL_TYPE.BREAKFAST]: MEAL_SIZE.NORMAL,
    [MEAL_TYPE.LUNCH]: MEAL_SIZE.BIG,
    [MEAL_TYPE.DINNER]: MEAL_SIZE.BIG,
    [MEAL_TYPE.SNACK]: MEAL_SIZE.SMALL,
    [MEAL_TYPE.DESSERT]: MEAL_SIZE.SMALL
  };

  return {
    ...baseDefaults,
    mealSize: mealSizeByType[mealType] || MEAL_SIZE.NORMAL,
    dishCategories: dishCategoriesByMealType[mealType] || []
  };
}

export function StepThreeOneSchedule({ control }) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'mealSettings'
  });
  const {
    formState: { errors }
  } = useFormContext();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && fields.length === 0) {
      append([
        getMealDefaults(MEAL_TYPE.BREAKFAST),
        getMealDefaults(MEAL_TYPE.LUNCH),
        getMealDefaults(MEAL_TYPE.DINNER),
        getMealDefaults(MEAL_TYPE.SNACK),
        getMealDefaults(MEAL_TYPE.DESSERT)
      ]);
      hasInitialized.current = true;
    }
  }, []);

  return (
    <div className='space-y-6'>
      <title>Lịch trình ăn</title>
      <meta
        name='description'
        content='Thiết lập số lượng và thời gian các bữa ăn trong ngày.'
      />
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
            <p className='text-sm text-muted-foreground'>
              Sử dụng các nút mũi tên để thay đổi thứ tự bữa ăn trong ngày
            </p>
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
                            className='h-11 text-base font-medium md:text-base'
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
              className='h-11 w-full text-base font-medium md:text-base'
              disabled={fields.length >= 10}
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
            {errors.mealSettings && (
              <p className='text-destructive text-sm font-medium'>
                {errors.mealSettings.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
