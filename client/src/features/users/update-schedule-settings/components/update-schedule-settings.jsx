import { yupResolver } from '@hookform/resolvers/yup';
import { Calendar, PlusIcon, Save, XIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
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
import { Spinner } from '~/components/ui/spinner';
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
import { useUpdateScheduleSettings } from '~/features/users/update-schedule-settings/api/update-schedule-settings';
import { updateScheduleSettingsSchema } from '~/features/users/update-schedule-settings/schemas/update-schedule-settings-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';

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
                <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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
                <MultiSelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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
                <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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
                <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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
                <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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
                <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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

const UpdateScheduleSettings = () => {
  const { data: profile } = useProfileForPage();
  const { mutate: updateScheduleSettings, isPending: isUpdating } =
    useUpdateScheduleSettings({
      onSuccess: response => {
        toast.success(
          response?.message || 'Cập nhật cài đặt lịch trình thành công'
        );
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message ||
            'Cập nhật cài đặt lịch trình thất bại'
        );
      }
    });

  const form = useForm({
    resolver: yupResolver(updateScheduleSettingsSchema),
    defaultValues: {
      mealSettings: []
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'mealSettings'
  });

  // Initialize with user's meal settings or defaults
  useEffect(() => {
    if (profile?.mealSettings && profile.mealSettings.length > 0) {
      replace(profile.mealSettings);
    } else if (fields.length === 0) {
      const defaultMeals = MEAL_TYPE_OPTIONS.map(option =>
        getMealDefaults(option.value)
      );
      replace(defaultMeals);
    }
  }, [profile, fields.length, replace]);

  const handleSave = data => {
    updateScheduleSettings(data);
  };

  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Calendar className='h-7 w-7' />
        <h1 className='text-2xl font-bold'>Cài đặt lịch trình bữa ăn</h1>
      </div>
      <p className='text-sm text-muted-foreground mb-6'>
        Thiết lập các bữa ăn hàng ngày và sở thích của bạn
      </p>

      <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className='space-y-6'>
            <div className='space-y-4'>
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className='border-input relative rounded-xl border p-6 space-y-4'
                  >
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-2 top-2'
                      onClick={() => remove(index)}
                    >
                      <XIcon className='h-4 w-4' />
                    </Button>

                    <MealSettingFields control={form.control} index={index} />
                  </div>
                );
              })}
            </div>

            <Button
              type='button'
              variant='outline'
              size='sm'
              className='w-full rounded-xl'
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
              <PlusIcon className='h-4 w-4 mr-1' />
              Thêm bữa ăn
            </Button>

            <div className='flex justify-end'>
              <Button
                type='submit'
                disabled={isUpdating}
                className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
              >
                {isUpdating ? (
                  <Spinner className='h-4 w-4 mr-1' />
                ) : (
                  <Save className='h-4 w-4 mr-1' />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateScheduleSettings;
