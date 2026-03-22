import { yupResolver } from '@hookform/resolvers/yup';
import { Calendar, PlusIcon, Save, Sparkles, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
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

const toLabelMap = options =>
  options.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

const MEAL_SIZE_LABELS = toLabelMap(MEAL_SIZE_OPTIONS);
const AVAILABLE_TIME_LABELS = toLabelMap(AVAILABLE_TIME_OPTIONS);
const COMPLEXITY_LABELS = toLabelMap(MEAL_COMPLEXITY_OPTIONS);
const DISH_CATEGORY_LABELS = toLabelMap(DISH_CATEGORY_OPTIONS);

function MealSettingFields({ control, index }) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
              Khả năng nấu<span className='text-destructive'>*</span>
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

  const watchedMealSettings = form.watch('mealSettings');
  const usedMealTypes = new Set(
    (watchedMealSettings || []).map(setting => setting?.name).filter(Boolean)
  );
  const quickAddMealTypes = MEAL_TYPE_OPTIONS.filter(
    option => !usedMealTypes.has(option.value)
  );

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
    <div className='px-4 pb-24 sm:px-6'>
      <div className='mx-auto max-w-5xl'>
        <div className='mb-6 rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/30 p-5 shadow-sm'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <div className='mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                <Sparkles className='h-3.5 w-3.5' />
                Meal planner
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='h-6 w-6 text-primary' />
                <h1 className='text-2xl font-bold'>Cài đặt bữa ăn</h1>
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                Thiết lập từng bữa ăn theo thời gian, khẩu phần và mức độ nấu
                nướng để hệ thống gợi ý chính xác hơn.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className='space-y-5'>
            <div className='space-y-4'>
              {fields.map((field, index) => {
                const mealSetting = watchedMealSettings?.[index] || {};
                const dishCategoryLabels = (mealSetting?.dishCategories || [])
                  .map(item => DISH_CATEGORY_LABELS[item])
                  .filter(Boolean)
                  .slice(0, 3);

                return (
                  <section
                    key={field.id}
                    className='rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:p-5'
                  >
                    <div className='mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/70 pb-4'>
                      <div>
                        <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                          Bữa #{index + 1}
                        </p>
                        <h3 className='mt-1 text-lg font-semibold'>
                          {mealSetting?.name || 'Bữa ăn mới'}
                        </h3>
                        <div className='mt-2 flex flex-wrap gap-2'>
                          {mealSetting?.mealSize && (
                            <Badge variant='outline'>
                              {MEAL_SIZE_LABELS[mealSetting.mealSize]}
                            </Badge>
                          )}
                          {mealSetting?.availableTime && (
                            <Badge variant='outline'>
                              {AVAILABLE_TIME_LABELS[mealSetting.availableTime]}
                            </Badge>
                          )}
                          {mealSetting?.complexity && (
                            <Badge variant='outline'>
                              {COMPLEXITY_LABELS[mealSetting.complexity]}
                            </Badge>
                          )}
                          {dishCategoryLabels.length > 0 && (
                            <Badge variant='outline'>
                              {dishCategoryLabels.join(', ')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className='text-destructive hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <Trash2 className='mr-1 h-4 w-4' />
                        Xóa bữa
                      </Button>
                    </div>

                    <MealSettingFields control={form.control} index={index} />
                  </section>
                );
              })}
            </div>

            <section className='rounded-2xl border border-dashed border-border bg-muted/20 p-4 sm:p-5'>
              <p className='text-sm font-medium'>Thêm nhanh bữa ăn</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Chọn loại bữa ăn để thêm nhanh với cấu hình mặc định hợp lý.
              </p>

              <div className='mt-3 flex flex-wrap gap-2'>
                {quickAddMealTypes.map(option => (
                  <Button
                    key={option.value}
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => append(getMealDefaults(option.value))}
                    className='rounded-full'
                  >
                    <PlusIcon className='mr-1 h-4 w-4' />
                    {option.label}
                  </Button>
                ))}

                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  className='rounded-full'
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
                  <PlusIcon className='mr-1 h-4 w-4' />
                  Bữa tùy chỉnh
                </Button>
              </div>
            </section>

            <div className='fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
              <div className='mx-auto flex max-w-5xl justify-end'>
                <Button
                  type='submit'
                  disabled={isUpdating}
                  className='w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto'
                >
                  {isUpdating ? (
                    <Spinner className='mr-1 h-4 w-4' />
                  ) : (
                    <Save className='mr-1 h-4 w-4' />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateScheduleSettings;
