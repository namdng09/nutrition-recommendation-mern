import { yupResolver } from '@hookform/resolvers/yup';
import { Calculator, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { Slider } from '~/components/ui/slider';
import { Spinner } from '~/components/ui/spinner';
import { USER_TARGET, USER_TARGET_OPTIONS } from '~/constants/user-target';
import {
  useCalculateNutrition,
  useUpdateNutritionTarget
} from '~/features/users/update-nutrition-target/api/update-nutrition-target';
import { updateNutritionTargetSchema } from '~/features/users/update-nutrition-target/schemas/update-nutrition-target-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { cn } from '~/lib/utils';

export function UpdateNutritionTarget() {
  const { data: profile } = useProfileForPage();
  const [mode, setMode] = useState('generic');
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateNutritionTarget, isPending: isUpdating } =
    useUpdateNutritionTarget({
      onSuccess: response => {
        toast.success(
          response?.message || 'Cập nhật mục tiêu dinh dưỡng thành công'
        );
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message ||
            'Cập nhật mục tiêu dinh dưỡng thất bại'
        );
      }
    });

  const { mutate: calculateNutrition, isPending: isCalculating } =
    useCalculateNutrition({
      onSuccess: response => {
        const calculated = response.data;
        if (calculated) {
          // Update nutrition target values
          form.setValue('nutritionTarget', calculated, { shouldDirty: true });
          toast.success('Tính toán dinh dưỡng thành công');
        }
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Tính toán dinh dưỡng thất bại'
        );
      }
    });

  const form = useForm({
    resolver: yupResolver(updateNutritionTargetSchema),
    values: profile
      ? {
          goal: {
            target: profile.goal?.target || '',
            weightGoal: profile.goal?.weightGoal || undefined,
            targetWeightChange: profile.goal?.targetWeightChange || undefined
          },
          nutritionTarget: {
            caloriesTarget: profile.nutritionTarget?.caloriesTarget || 0,
            macros: {
              carbs: {
                min: profile.nutritionTarget?.macros?.carbs?.min || 0,
                max: profile.nutritionTarget?.macros?.carbs?.max || 0
              },
              fat: {
                min: profile.nutritionTarget?.macros?.fat?.min || 0,
                max: profile.nutritionTarget?.macros?.fat?.max || 0
              },
              protein: {
                min: profile.nutritionTarget?.macros?.protein?.min || 0,
                max: profile.nutritionTarget?.macros?.protein?.max || 0
              }
            }
          }
        }
      : undefined
  });

  const currentWeight =
    profile?.weightRecord?.length > 0
      ? profile.weightRecord
          .slice()
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight
      : 0;

  // Check if has specific goal on mount
  useEffect(() => {
    const hasSpecificGoal =
      profile?.goal?.weightGoal || profile?.goal?.targetWeightChange;
    if (hasSpecificGoal) {
      setMode('exact');
    }
  }, [profile]);

  // Inference Logic for Exact Mode - auto infer target based on weight goal
  useEffect(() => {
    if (mode === 'exact') {
      const weightGoal = form.watch('goal.weightGoal');
      if (weightGoal && currentWeight) {
        let target;
        const wGoal = parseFloat(weightGoal);
        const wCurrent = parseFloat(currentWeight);

        if (!isNaN(wGoal) && !isNaN(wCurrent)) {
          if (wGoal < wCurrent) target = USER_TARGET.LOSE_FAT;
          else if (wGoal > wCurrent) target = USER_TARGET.BUILD_MUSCLE;
          else target = USER_TARGET.MAINTAIN_WEIGHT;

          if (target !== form.watch('goal.target')) {
            form.setValue('goal.target', target);
          }
        }
      }
    }
  }, [mode, form.watch('goal.weightGoal'), currentWeight, form]);

  const handleModeChange = newMode => {
    setMode(newMode);

    // Clear exact mode fields when switching to generic
    if (newMode === 'generic') {
      form.setValue('goal.weightGoal', undefined);
      form.setValue('goal.targetWeightChange', undefined);
    }
  };

  // Auto save goal when in exact mode and both fields are filled
  useEffect(() => {
    if (mode === 'exact') {
      const weightGoal = form.watch('goal.weightGoal');
      const targetWeightChange = form.watch('goal.targetWeightChange');
      const target = form.watch('goal.target');

      if (weightGoal && targetWeightChange && target) {
        // All required fields are filled, auto save
        const goalData = {
          goal: {
            target,
            weightGoal: parseFloat(weightGoal),
            targetWeightChange: parseFloat(targetWeightChange)
          }
        };

        updateNutritionTarget(goalData);
      }
    }
  }, [
    mode,
    form.watch('goal.weightGoal'),
    form.watch('goal.targetWeightChange'),
    form.watch('goal.target')
  ]);

  const handleCalculate = () => {
    const formData = form.getValues();

    calculateNutrition({
      height: profile?.height,
      weight: currentWeight,
      bodyfat: profile?.bodyfat,
      activityLevel: profile?.activityLevel,
      goal: formData.goal,
      diet: profile?.diet,
      gender: profile?.gender,
      dob: profile?.dob,
      allergens: profile?.allergens
    });
  };

  const handleSave = data => {
    updateNutritionTarget(data);
  };

  const nutritionTarget = form.watch('nutritionTarget');
  const calories = nutritionTarget?.caloriesTarget || 0;
  const macros = nutritionTarget?.macros || {
    carbs: { min: 0, max: 0 },
    fat: { min: 0, max: 0 },
    protein: { min: 0, max: 0 }
  };

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Target className='h-5 w-5 text-primary' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Mục tiêu dinh dưỡng
            </h1>
          </div>
          <p className='text-sm text-muted-foreground sm:text-base'>
            Chúng tôi sẽ điều chỉnh mục tiêu dinh dưỡng hàng ngày phù hợp với
            mục tiêu của bạn
          </p>
        </div>

        {/* Form Card */}
        <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
              {/* Form Content */}
              <div className='space-y-0'>
                {/* Goal Section */}
                <div className='p-6 space-y-6'>
                  <div className='space-y-1'>
                    <h3 className='text-base font-semibold'>
                      Mục tiêu của bạn
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Đặt mục tiêu cân nặng và sức khỏe của bạn
                    </p>
                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8'>
                    {/* Left Column - Icon */}
                    <div className='hidden lg:flex items-center justify-center'>
                      <div className='relative flex items-center justify-center'>
                        <Target
                          size={180}
                          strokeWidth={1}
                          className='text-primary/30'
                        />
                      </div>
                    </div>

                    {/* Right Column - Goal Form */}
                    <div className='space-y-6 min-w-0'>
                      {/* Mode Toggle */}
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0'>
                        <h4 className='text-sm font-medium'>
                          Thiết lập mục tiêu
                        </h4>
                        <div className='flex items-center gap-2 w-full sm:w-auto'>
                          <button
                            type='button'
                            onClick={() => handleModeChange('generic')}
                            className={cn(
                              'flex-1 sm:flex-none px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200',
                              mode === 'generic'
                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                : 'border-border bg-background hover:bg-accent hover:border-primary/30'
                            )}
                          >
                            Mục tiêu chung
                          </button>
                          <button
                            type='button'
                            onClick={() => handleModeChange('exact')}
                            className={cn(
                              'flex-1 sm:flex-none px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200',
                              mode === 'exact'
                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                : 'border-border bg-background hover:bg-accent hover:border-primary/30'
                            )}
                          >
                            Mục tiêu cụ thể
                          </button>
                        </div>
                      </div>

                      {/* Generic Target */}
                      {mode === 'generic' && (
                        <FormField
                          control={form.control}
                          name='goal.target'
                          render={({ field }) => (
                            <FormItem className='space-y-4'>
                              <FormLabel className='text-sm font-medium'>
                                Tôi muốn{' '}
                                <span className='text-destructive'>*</span>
                              </FormLabel>
                              <FormControl>
                                <div className='flex flex-col gap-3'>
                                  {USER_TARGET_OPTIONS.map(option => (
                                    <button
                                      key={option.value}
                                      type='button'
                                      onClick={() => {
                                        field.onChange(option.value);
                                        // Auto save when selecting generic target
                                        setTimeout(() => {
                                          updateNutritionTarget({
                                            goal: {
                                              target: option.value
                                            }
                                          });
                                        }, 100);
                                      }}
                                      className={cn(
                                        'px-5 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 text-left',
                                        field.value === option.value
                                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                          : 'border-border bg-background hover:bg-accent hover:border-primary/30'
                                      )}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Specific Goal Fields */}
                      {mode === 'exact' && (
                        <div className='space-y-5 pt-2'>
                          <FormField
                            control={form.control}
                            name='goal.weightGoal'
                            render={({ field }) => (
                              <FormItem className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                                <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                                  Cân nặng mục tiêu{' '}
                                  <span className='text-destructive'>*</span>
                                </FormLabel>
                                <div className='space-y-2'>
                                  <div className='flex items-center gap-2 max-w-[200px]'>
                                    <FormControl>
                                      <Input
                                        type='text'
                                        className='text-center tabular-nums'
                                        placeholder={currentWeight.toString()}
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={e => {
                                          const value = e.target.value;
                                          if (
                                            value === '' ||
                                            /^\d*\.?\d*$/.test(value)
                                          ) {
                                            field.onChange(value);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <span className='text-sm text-muted-foreground whitespace-nowrap'>
                                      kg
                                    </span>
                                  </div>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='goal.targetWeightChange'
                            render={({ field }) => (
                              <FormItem className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                                <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                                  Tốc độ thay đổi{' '}
                                  <span className='text-destructive'>*</span>
                                </FormLabel>
                                <div className='space-y-2'>
                                  <div className='flex items-center gap-2 max-w-[240px]'>
                                    <FormControl>
                                      <Input
                                        type='text'
                                        className='text-center tabular-nums'
                                        placeholder='0.5'
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={e => {
                                          const value = e.target.value;
                                          if (
                                            value === '' ||
                                            /^\d*\.?\d*$/.test(value)
                                          ) {
                                            field.onChange(value);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <span className='text-sm text-muted-foreground whitespace-nowrap'>
                                      kg/tuần
                                    </span>
                                  </div>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          {/* Auto-inferred target display */}
                          {form.watch('goal.target') && (
                            <div className='p-4 rounded-lg bg-primary/5 border border-primary/20'>
                              <p className='text-sm text-muted-foreground'>
                                Mục tiêu được xác định:{' '}
                                <span className='font-semibold text-primary'>
                                  {
                                    USER_TARGET_OPTIONS.find(
                                      opt =>
                                        opt.value === form.watch('goal.target')
                                    )?.label
                                  }
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Nutrition Target Section */}
                <div className='p-6 space-y-6'>
                  <div className='space-y-1'>
                    <h3 className='text-base font-semibold flex items-center gap-2'>
                      <Calculator className='h-5 w-5 text-primary' />
                      Mục tiêu dinh dưỡng
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Xem và điều chỉnh mục tiêu dinh dưỡng hàng ngày
                    </p>
                  </div>

                  {!isEditing ? (
                    /* Summary View */
                    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                      <div className='space-y-3'>
                        <div className='text-3xl font-bold text-primary'>
                          {calories} Calories mỗi ngày
                        </div>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-3 text-base'>
                            <div className='size-3 rounded-full bg-chart-1 shadow-[0_0_8px_rgba(var(--chart-1),0.6)]' />
                            <span className='font-medium'>
                              {macros.carbs.min} - {macros.carbs.max}g Tinh bột
                            </span>
                          </div>
                          <div className='flex items-center gap-3 text-base'>
                            <div className='size-3 rounded-full bg-chart-2 shadow-[0_0_8px_rgba(var(--chart-2),0.6)]' />
                            <span className='font-medium'>
                              {macros.fat.min} - {macros.fat.max}g Chất béo
                            </span>
                          </div>
                          <div className='flex items-center gap-3 text-base'>
                            <div className='size-3 rounded-full bg-chart-3 shadow-[0_0_8px_rgba(var(--chart-3),0.6)]' />
                            <span className='font-medium'>
                              {macros.protein.min} - {macros.protein.max}g Chất
                              đạm
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex gap-3'>
                        <Button
                          type='button'
                          onClick={() => setIsEditing(true)}
                          variant='outline'
                          className='rounded-lg px-6 border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                        >
                          Chỉnh sửa mục tiêu
                        </Button>
                        <Button
                          type='button'
                          onClick={handleCalculate}
                          disabled={isCalculating}
                          variant='outline'
                          className='rounded-lg px-6'
                        >
                          {isCalculating ? (
                            <Spinner className='h-4 w-4 mr-2' />
                          ) : (
                            <Calculator className='h-4 w-4 mr-2' />
                          )}
                          Tính toán lại
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Edit View */
                    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                      {/* Calories Row */}
                      <div className='flex items-center justify-between py-2 border-b border-border/40'>
                        <h4 className='text-lg font-bold'>Calories</h4>
                        <FormField
                          control={form.control}
                          name='nutritionTarget.caloriesTarget'
                          render={({ field }) => (
                            <FormItem className='m-0 space-y-0'>
                              <FormControl>
                                <div className='flex items-center gap-3'>
                                  <Input
                                    type='text'
                                    className='w-24 h-10 text-center text-lg font-bold rounded-xl border-border bg-muted/30 focus-visible:ring-primary'
                                    {...field}
                                    value={field.value ?? 0}
                                    onChange={e => {
                                      const val = e.target.value;
                                      if (val === '' || /^\d+$/.test(val)) {
                                        field.onChange(
                                          val === '' ? 0 : parseInt(val)
                                        );
                                      }
                                    }}
                                  />
                                  <span className='text-muted-foreground font-semibold'>
                                    kcal
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Macros Section */}
                      <div className='space-y-6 pt-2'>
                        {/* Carbs */}
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className='size-2.5 rounded-full bg-chart-1 shadow-[0_0_8px_rgba(var(--chart-1),0.5)]' />
                              <span className='text-base font-bold tracking-tight'>
                                Tinh bột
                              </span>
                            </div>
                            <div className='flex items-center gap-3'>
                              <Input
                                type='text'
                                value={
                                  form.watch(
                                    'nutritionTarget.macros.carbs.min'
                                  ) || 0
                                }
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) {
                                    form.setValue(
                                      'nutritionTarget.macros.carbs.min',
                                      val === '' ? 0 : parseInt(val)
                                    );
                                  }
                                }}
                                className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                              />
                              <span className='text-muted-foreground text-xs font-medium'>
                                đến
                              </span>
                              <Input
                                type='text'
                                value={
                                  form.watch(
                                    'nutritionTarget.macros.carbs.max'
                                  ) || 0
                                }
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) {
                                    form.setValue(
                                      'nutritionTarget.macros.carbs.max',
                                      val === '' ? 0 : parseInt(val)
                                    );
                                  }
                                }}
                                className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                              />
                              <span className='font-bold text-base'>g</span>
                            </div>
                          </div>
                          <Slider
                            value={[
                              form.watch('nutritionTarget.macros.carbs.min') ||
                                0,
                              form.watch('nutritionTarget.macros.carbs.max') ||
                                0
                            ]}
                            onValueChange={([min, max]) => {
                              form.setValue(
                                'nutritionTarget.macros.carbs.min',
                                min
                              );
                              form.setValue(
                                'nutritionTarget.macros.carbs.max',
                                max
                              );
                            }}
                            min={0}
                            max={600}
                            step={1}
                            className='[&_[role=slider]]:bg-chart-1 [&_[role=slider]]:border-chart-1'
                          />
                        </div>

                        {/* Fats */}
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className='size-2.5 rounded-full bg-chart-2 shadow-[0_0_8px_rgba(var(--chart-2),0.5)]' />
                              <span className='text-base font-bold tracking-tight'>
                                Chất béo
                              </span>
                            </div>
                            <div className='flex items-center gap-3'>
                              <Input
                                type='text'
                                value={
                                  form.watch(
                                    'nutritionTarget.macros.fat.min'
                                  ) || 0
                                }
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) {
                                    form.setValue(
                                      'nutritionTarget.macros.fat.min',
                                      val === '' ? 0 : parseInt(val)
                                    );
                                  }
                                }}
                                className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                              />
                              <span className='text-muted-foreground text-xs font-medium'>
                                đến
                              </span>
                              <Input
                                type='text'
                                value={
                                  form.watch(
                                    'nutritionTarget.macros.fat.max'
                                  ) || 0
                                }
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) {
                                    form.setValue(
                                      'nutritionTarget.macros.fat.max',
                                      val === '' ? 0 : parseInt(val)
                                    );
                                  }
                                }}
                                className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                              />
                              <span className='font-bold text-base'>g</span>
                            </div>
                          </div>
                          <Slider
                            value={[
                              form.watch('nutritionTarget.macros.fat.min') || 0,
                              form.watch('nutritionTarget.macros.fat.max') || 0
                            ]}
                            onValueChange={([min, max]) => {
                              form.setValue(
                                'nutritionTarget.macros.fat.min',
                                min
                              );
                              form.setValue(
                                'nutritionTarget.macros.fat.max',
                                max
                              );
                            }}
                            min={0}
                            max={200}
                            step={1}
                            className='[&_[role=slider]]:bg-chart-2 [&_[role=slider]]:border-chart-2'
                          />
                        </div>

                        {/* Protein */}
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className='size-2.5 rounded-full bg-chart-3 shadow-[0_0_8px_rgba(var(--chart-3),0.5)]' />
                              <span className='text-base font-bold tracking-tight'>
                                Chất đạm
                              </span>
                            </div>
                            <div className='flex items-center gap-3'>
                              <Input
                                type='text'
                                value={
                                  form.watch(
                                    'nutritionTarget.macros.protein.min'
                                  ) || 0
                                }
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) {
                                    form.setValue(
                                      'nutritionTarget.macros.protein.min',
                                      val === '' ? 0 : parseInt(val)
                                    );
                                  }
                                }}
                                className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                              />
                              <span className='text-muted-foreground text-xs font-medium'>
                                đến
                              </span>
                              <Input
                                type='text'
                                value={
                                  form.watch(
                                    'nutritionTarget.macros.protein.max'
                                  ) || 0
                                }
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) {
                                    form.setValue(
                                      'nutritionTarget.macros.protein.max',
                                      val === '' ? 0 : parseInt(val)
                                    );
                                  }
                                }}
                                className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                              />
                              <span className='font-bold text-base'>g</span>
                            </div>
                          </div>
                          <Slider
                            value={[
                              form.watch(
                                'nutritionTarget.macros.protein.min'
                              ) || 0,
                              form.watch(
                                'nutritionTarget.macros.protein.max'
                              ) || 0
                            ]}
                            onValueChange={([min, max]) => {
                              form.setValue(
                                'nutritionTarget.macros.protein.min',
                                min
                              );
                              form.setValue(
                                'nutritionTarget.macros.protein.max',
                                max
                              );
                            }}
                            min={0}
                            max={400}
                            step={1}
                            className='[&_[role=slider]]:bg-chart-3 [&_[role=slider]]:border-chart-3'
                          />
                        </div>
                      </div>

                      <div className='pt-2'>
                        <Button
                          type='button'
                          onClick={() => setIsEditing(false)}
                          variant='outline'
                        >
                          Chỉnh sửa xong
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className='flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4'>
                <Button
                  type='submit'
                  disabled={isUpdating}
                  size='default'
                  className='min-w-[140px]'
                >
                  {isUpdating ? (
                    <>
                      <Spinner className='h-4 w-4 mr-2' />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
