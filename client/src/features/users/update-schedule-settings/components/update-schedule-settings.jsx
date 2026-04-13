import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2
} from 'lucide-react';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { HiSparkles } from 'react-icons/hi';
import { IoCafe, IoFastFood, IoLeaf, IoMoon, IoSunny } from 'react-icons/io5';
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
import { cn } from '~/lib/utils';

const MEAL_TYPE_VALUES = new Set(MEAL_TYPE_OPTIONS.map(option => option.value));
const MEAL_SIZE_VALUES = new Set(MEAL_SIZE_OPTIONS.map(option => option.value));
const COOKING_PREFERENCE_VALUES = new Set(
  COOKING_PREFERENCE_OPTIONS.map(option => option.value)
);
const AVAILABLE_TIME_VALUES = new Set(
  AVAILABLE_TIME_OPTIONS.map(option => option.value)
);
const MEAL_COMPLEXITY_VALUES = new Set(
  MEAL_COMPLEXITY_OPTIONS.map(option => option.value)
);
const DISH_CATEGORY_VALUES = new Set(
  DISH_CATEGORY_OPTIONS.map(option => option.value)
);

const DEFAULT_MEAL_ORDER = [
  MEAL_TYPE.BREAKFAST,
  MEAL_TYPE.LUNCH,
  MEAL_TYPE.DINNER,
  MEAL_TYPE.SNACK
];

const DEFAULT_DISH_CATEGORIES_BY_MEAL_TYPE = {
  [MEAL_TYPE.BREAKFAST]: [DISH_CATEGORY.BREAKFAST, DISH_CATEGORY.BEVERAGE],
  [MEAL_TYPE.LUNCH]: [
    DISH_CATEGORY.MAIN_COURSE,
    DISH_CATEGORY.SIDE_DISH,
    DISH_CATEGORY.SOUP
  ],
  [MEAL_TYPE.DINNER]: [
    DISH_CATEGORY.MAIN_COURSE,
    DISH_CATEGORY.SIDE_DISH,
    DISH_CATEGORY.SALAD
  ],
  [MEAL_TYPE.SNACK]: [DISH_CATEGORY.SNACK, DISH_CATEGORY.BEVERAGE],
  [MEAL_TYPE.DESSERT]: [DISH_CATEGORY.DESSERT, DISH_CATEGORY.BEVERAGE]
};

const DEFAULT_MEAL_SIZE_BY_MEAL_TYPE = {
  [MEAL_TYPE.BREAKFAST]: MEAL_SIZE.NORMAL,
  [MEAL_TYPE.LUNCH]: MEAL_SIZE.BIG,
  [MEAL_TYPE.DINNER]: MEAL_SIZE.BIG,
  [MEAL_TYPE.SNACK]: MEAL_SIZE.SMALL,
  [MEAL_TYPE.DESSERT]: MEAL_SIZE.SMALL
};

const createMealSettingDefaults = mealType => ({
  name: mealType,
  dishCategories: DEFAULT_DISH_CATEGORIES_BY_MEAL_TYPE[mealType] ?? [
    DISH_CATEGORY.MAIN_COURSE
  ],
  cookingPreference: COOKING_PREFERENCE.CAN_COOK,
  mealSize: DEFAULT_MEAL_SIZE_BY_MEAL_TYPE[mealType] ?? MEAL_SIZE.NORMAL,
  availableTime: AVAILABLE_TIME.SOME_TIME,
  complexity: MEAL_COMPLEXITY.SIMPLE
});

const getSafeValue = (value, allowedValues, fallback) =>
  allowedValues.has(value) ? value : fallback;

const normalizeMealSetting = (mealSetting, index) => {
  const fallbackMealType =
    DEFAULT_MEAL_ORDER[index % DEFAULT_MEAL_ORDER.length] ??
    MEAL_TYPE.BREAKFAST;
  const fallback = createMealSettingDefaults(fallbackMealType);

  const safeMealType = getSafeValue(
    mealSetting?.name,
    MEAL_TYPE_VALUES,
    fallback.name
  );

  const normalizedDishCategories = Array.isArray(mealSetting?.dishCategories)
    ? mealSetting.dishCategories.filter(value =>
        DISH_CATEGORY_VALUES.has(value)
      )
    : [];

  return {
    name: safeMealType,
    dishCategories:
      normalizedDishCategories.length > 0
        ? normalizedDishCategories
        : createMealSettingDefaults(safeMealType).dishCategories,
    cookingPreference: getSafeValue(
      mealSetting?.cookingPreference,
      COOKING_PREFERENCE_VALUES,
      fallback.cookingPreference
    ),
    mealSize: getSafeValue(
      mealSetting?.mealSize,
      MEAL_SIZE_VALUES,
      fallback.mealSize
    ),
    availableTime: getSafeValue(
      mealSetting?.availableTime,
      AVAILABLE_TIME_VALUES,
      fallback.availableTime
    ),
    complexity: getSafeValue(
      mealSetting?.complexity,
      MEAL_COMPLEXITY_VALUES,
      fallback.complexity
    )
  };
};

const buildInitialMealSettings = mealSettings => {
  if (Array.isArray(mealSettings) && mealSettings.length > 0) {
    return mealSettings.map((item, index) => normalizeMealSetting(item, index));
  }

  return DEFAULT_MEAL_ORDER.map(createMealSettingDefaults);
};

const getNextMealType = mealSettings => {
  const usedMealTypes = new Set(mealSettings.map(item => item.name));
  const nextOption = MEAL_TYPE_OPTIONS.find(
    option => !usedMealTypes.has(option.value)
  );

  return nextOption?.value ?? MEAL_TYPE.BREAKFAST;
};

const getMealTypeLabel = mealType =>
  MEAL_TYPE_OPTIONS.find(option => option.value === mealType)?.label ??
  'Bữa ăn';

const MEAL_ICON_CONFIG = {
  breakfast: <IoCafe className='text-orange-400' />,
  lunch: <IoSunny className='text-amber-500' />,
  dinner: <IoMoon className='text-indigo-400' />,
  snack: <IoFastFood className='text-emerald-500' />,
  default: <IoLeaf className='text-slate-400' />
};

const getMealIcon = mealType => {
  const normalizedType = String(mealType || '').toLowerCase();

  if (normalizedType.includes('breakfast') || normalizedType.includes('sáng')) {
    return MEAL_ICON_CONFIG.breakfast;
  }

  if (normalizedType.includes('lunch') || normalizedType.includes('trưa')) {
    return MEAL_ICON_CONFIG.lunch;
  }

  if (normalizedType.includes('dinner') || normalizedType.includes('tối')) {
    return MEAL_ICON_CONFIG.dinner;
  }

  if (
    normalizedType.includes('snack') ||
    normalizedType.includes('dessert') ||
    normalizedType.includes('nhẹ')
  ) {
    return MEAL_ICON_CONFIG.snack;
  }

  return MEAL_ICON_CONFIG.default;
};

const SortableMealCard = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-border bg-background/80 p-4 sm:p-5',
        isDragging ? 'z-10 shadow-lg ring-2 ring-primary/25' : ''
      )}
    >
      {children({ attributes, listeners, setActivatorNodeRef })}
    </div>
  );
};

const UpdateScheduleSettings = () => {
  const { data: profile } = useProfileForPage();
  const initialMealSettings = useMemo(
    () => buildInitialMealSettings(profile?.mealSettings),
    [profile?.mealSettings]
  );

  const { mutate: updateScheduleSettings, isPending: isUpdating } =
    useUpdateScheduleSettings({
      onSuccess: response => {
        toast.success(response?.message || 'Cập nhật lịch bữa ăn thành công');
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Cập nhật lịch bữa ăn thất bại'
        );
      }
    });

  const form = useForm({
    resolver: yupResolver(updateScheduleSettingsSchema),
    values: {
      mealSettings: initialMealSettings
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'mealSettings'
  });

  const mealSettingsValues = form.watch('mealSettings') || [];

  const handleSubmit = values => {
    updateScheduleSettings(values);
  };

  const addMealSetting = () => {
    const currentMealSettings = form.getValues('mealSettings') || [];
    if (currentMealSettings.length >= MEAL_TYPE_OPTIONS.length) {
      return;
    }

    const nextMealType = getNextMealType(currentMealSettings);
    append(createMealSettingDefaults(nextMealType));
  };

  const isMealTypeTaken = (mealType, currentIndex) =>
    mealSettingsValues.some(
      (item, index) => index !== currentIndex && item?.name === mealType
    );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8
      }
    })
  );

  const handleDragEnd = event => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex(item => item.id === active.id);
    const newIndex = fields.findIndex(item => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    move(oldIndex, newIndex);
  };

  return (
    <div className='px-4 pb-10 sm:px-6'>
      <div className='mx-auto w-full max-w-5xl'>
        <div className='rounded-[32px] border border-border bg-card p-6 shadow-sm'>
          <div className='mb-6 rounded-[28px] bg-card/70 p-4 shadow-sm backdrop-blur sm:p-5'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10'>
                      <CalendarClock className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <h1 className='text-2xl font-black tracking-tight text-foreground sm:text-[28px]'>
                        Cài đặt bữa ăn
                      </h1>
                    </div>
                  </div>
                </div>

                <Button
                  type='button'
                  onClick={addMealSetting}
                  disabled={fields.length >= MEAL_TYPE_OPTIONS.length}
                  className='flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-black uppercase tracking-wide'
                >
                  <Plus className='h-4 w-4' />
                  Thêm bữa ăn
                </Button>
              </div>

              <p className='text-[13px] font-medium leading-relaxed text-muted-foreground/80'>
                Thiết lập bữa ăn để AI gợi ý thực đơn đúng loại bữa, khẩu phần
                và thời gian nấu theo nhịp sinh hoạt của bạn.
              </p>

              <div className='flex flex-wrap items-center gap-3 rounded-2xl bg-primary/[0.06] px-4 py-3'>
                <div className='rounded-full bg-background px-3 py-1.5 text-[11px] font-black tracking-wide text-primary shadow-sm'>
                  {fields.length} bữa ăn
                </div>
                <div className='rounded-full bg-background px-3 py-1.5 text-[11px] font-black tracking-wide text-primary shadow-sm'>
                  {
                    new Set(
                      mealSettingsValues.map(item => item?.name).filter(Boolean)
                    ).size
                  }{' '}
                  loại bữa
                </div>
                <div className='flex items-center gap-1.5 text-[11px] font-bold text-primary/80'>
                  <HiSparkles size={14} />
                  Sẵn sàng tối ưu thực đơn
                </div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className='space-y-6'>
                <div className='mb-2 flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background px-4 py-3'>
                  <p className='hidden text-[11px] font-black uppercase tracking-wide text-muted-foreground sm:block'>
                    {fields.length}/{MEAL_TYPE_OPTIONS.length} bữa ăn
                  </p>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className='space-y-4'>
                      {fields.map((field, index) => (
                        <SortableMealCard key={field.id} id={field.id}>
                          {({ attributes, listeners, setActivatorNodeRef }) => (
                            <>
                              <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                                <div
                                  ref={setActivatorNodeRef}
                                  className='flex cursor-grab touch-none items-center gap-3 active:cursor-grabbing'
                                  {...attributes}
                                  {...listeners}
                                  title='Giữ và kéo để đổi vị trí'
                                >
                                  <GripVertical className='h-4 w-4 text-muted-foreground' />
                                  <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-xl'>
                                    {getMealIcon(
                                      mealSettingsValues?.[index]?.name ||
                                        field.name
                                    )}
                                  </div>
                                  <div>
                                    <p className='text-sm font-black uppercase tracking-wider text-foreground'>
                                      {getMealTypeLabel(
                                        mealSettingsValues?.[index]?.name ||
                                          field.name
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className='flex items-center gap-1'>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    disabled={index === 0}
                                    onClick={() => move(index, index - 1)}
                                    title='Đưa lên trên'
                                    className='rounded-xl'
                                  >
                                    <ChevronUp className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    disabled={index === fields.length - 1}
                                    onClick={() => move(index, index + 1)}
                                    title='Đưa xuống dưới'
                                    className='rounded-xl'
                                  >
                                    <ChevronDown className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    disabled={fields.length <= 1}
                                    onClick={() => remove(index)}
                                    className='rounded-xl text-destructive hover:bg-destructive hover:text-white'
                                    title='Xóa bữa ăn'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </div>

                              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                <FormField
                                  control={form.control}
                                  name={`mealSettings.${index}.name`}
                                  render={({ field: inputField }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Loại bữa ăn{' '}
                                        <span className='text-destructive'>
                                          *
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={inputField.value}
                                          onValueChange={inputField.onChange}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder='Chọn loại bữa ăn' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {MEAL_TYPE_OPTIONS.map(option => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                disabled={isMealTypeTaken(
                                                  option.value,
                                                  index
                                                )}
                                              >
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

                                <FormField
                                  control={form.control}
                                  name={`mealSettings.${index}.mealSize`}
                                  render={({ field: inputField }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Khẩu phần{' '}
                                        <span className='text-destructive'>
                                          *
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={inputField.value}
                                          onValueChange={inputField.onChange}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder='Chọn khẩu phần' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {MEAL_SIZE_OPTIONS.map(option => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                              >
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

                                <FormField
                                  control={form.control}
                                  name={`mealSettings.${index}.cookingPreference`}
                                  render={({ field: inputField }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Sở thích nấu ăn{' '}
                                        <span className='text-destructive'>
                                          *
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={inputField.value}
                                          onValueChange={inputField.onChange}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder='Chọn sở thích nấu ăn' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {COOKING_PREFERENCE_OPTIONS.map(
                                              option => (
                                                <SelectItem
                                                  key={option.value}
                                                  value={option.value}
                                                >
                                                  {option.label}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`mealSettings.${index}.availableTime`}
                                  render={({ field: inputField }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Thời gian sẵn có{' '}
                                        <span className='text-destructive'>
                                          *
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={inputField.value}
                                          onValueChange={inputField.onChange}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder='Chọn thời gian sẵn có' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {AVAILABLE_TIME_OPTIONS.map(
                                              option => (
                                                <SelectItem
                                                  key={option.value}
                                                  value={option.value}
                                                >
                                                  {option.label}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`mealSettings.${index}.complexity`}
                                  render={({ field: inputField }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Độ phức tạp{' '}
                                        <span className='text-destructive'>
                                          *
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={inputField.value}
                                          onValueChange={inputField.onChange}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder='Chọn độ phức tạp' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {MEAL_COMPLEXITY_OPTIONS.map(
                                              option => (
                                                <SelectItem
                                                  key={option.value}
                                                  value={option.value}
                                                >
                                                  {option.label}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className='mt-4'>
                                <FormField
                                  control={form.control}
                                  name={`mealSettings.${index}.dishCategories`}
                                  render={({ field: inputField }) => {
                                    const selectedValues =
                                      inputField.value || [];

                                    const toggleCategory = value => {
                                      if (selectedValues.includes(value)) {
                                        inputField.onChange(
                                          selectedValues.filter(
                                            item => item !== value
                                          )
                                        );
                                        return;
                                      }

                                      inputField.onChange([
                                        ...selectedValues,
                                        value
                                      ]);
                                    };

                                    return (
                                      <FormItem>
                                        <FormLabel>
                                          Danh mục món ăn{' '}
                                          <span className='text-destructive'>
                                            *
                                          </span>
                                        </FormLabel>

                                        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5'>
                                          {DISH_CATEGORY_OPTIONS.map(option => {
                                            const isSelected =
                                              selectedValues.includes(
                                                option.value
                                              );

                                            return (
                                              <button
                                                key={option.value}
                                                type='button'
                                                onClick={() =>
                                                  toggleCategory(option.value)
                                                }
                                                className={cn(
                                                  'rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors',
                                                  isSelected
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border bg-background hover:border-primary/40'
                                                )}
                                              >
                                                {option.label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    );
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </SortableMealCard>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {form.formState.errors.mealSettings?.message ? (
                  <p className='rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive'>
                    {form.formState.errors.mealSettings.message}
                  </p>
                ) : null}

                <Button
                  type='submit'
                  disabled={isUpdating}
                  className='mt-2 flex w-full items-center justify-center gap-2 rounded-[20px] bg-primary py-4 text-[12px] font-black tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]'
                >
                  {isUpdating ? (
                    <>
                      <Spinner className='h-4 w-4' />
                      ĐANG LƯU...
                    </>
                  ) : (
                    'LƯU CÀI ĐẶT BỮA ĂN'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdateScheduleSettings;
