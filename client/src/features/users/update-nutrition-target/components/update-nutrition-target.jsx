import { yupResolver } from '@hookform/resolvers/yup';
import { Calculator, Save, Target } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Slider } from '~/components/ui/slider';
import { Spinner } from '~/components/ui/spinner';
import { ACTIVITY_LEVEL_OPTIONS } from '~/constants/activity-level';
import { BODYFAT_OPTIONS } from '~/constants/bodyfat';
import { USER_TARGET_OPTIONS } from '~/constants/user-target';
import {
  useCalculateNutrition,
  useUpdateNutritionTarget
} from '~/features/users/update-nutrition-target/api/update-nutrition-target';
import { updateNutritionTargetSchema } from '~/features/users/update-nutrition-target/schemas/update-nutrition-target-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';

export function UpdateNutritionTarget() {
  const { data: profile } = useProfileForPage();
  const [macroMode, setMacroMode] = useState(
    profile?.nutritionTarget?.macros ? 'manual' : 'auto'
  );

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
        // Auto-save calculated values
        updateNutritionTarget({
          nutritionTarget: {
            caloriesTarget: calculated.caloriesTarget,
            macros: calculated.macros
          }
        });
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
          height: profile.height || 0,
          weight: profile.weight || 0,
          bodyfat: profile.bodyfat || '',
          activityLevel: profile.activityLevel || '',
          goal: profile.goal || {
            target: '',
            weightGoal: 0,
            targetWeightChange: 0
          },
          macroMode,
          nutritionTarget: profile.nutritionTarget || {}
        }
      : undefined
  });

  const handleSave = data => {
    updateNutritionTarget(data);
  };

  const handleCalculate = () => {
    const formData = form.getValues();
    calculateNutrition({
      height: formData.height,
      weight: formData.weight,
      bodyfat: formData.bodyfat,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      diet: profile?.diet
    });
  };

  const currentMacros = profile?.nutritionTarget?.macros;

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-4 flex items-center gap-2'>
        <Target className='h-7 w-7 text-primary' />
        <h1 className='text-2xl font-bold'>Mục tiêu dinh dưỡng</h1>
      </div>

      <div className='space-y-6'>
        {/* Physical Metrics */}
        <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
          <div className='mb-6'>
            <h2 className='text-lg font-semibold'>Chỉ số cơ thể</h2>
            <p className='text-sm'>Nhập các chỉ số hiện tại của cơ thể bạn</p>
          </div>

          <Form {...form}>
            <form className='space-y-6'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='height'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chiều cao (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='175'
                          className='rounded-xl border-border focus-visible:ring-ring'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='weight'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cân nặng (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='70'
                          className='rounded-xl border-border focus-visible:ring-ring'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bodyfat'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỷ lệ mỡ</FormLabel>
                      <Select
                        key={profile?.id + '-bodyfat-' + (field.value ?? '')}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
                            <SelectValue placeholder='Chọn tỷ lệ mỡ' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BODYFAT_OPTIONS.map(option => (
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
                  control={form.control}
                  name='activityLevel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mức độ hoạt động</FormLabel>
                      <Select
                        key={
                          profile?.id + '-activityLevel-' + (field.value ?? '')
                        }
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
                            <SelectValue placeholder='Chọn mức độ hoạt động' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ACTIVITY_LEVEL_OPTIONS.map(option => (
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

              {/* Goal Section */}
              <div className='space-y-4 pt-2'>
                <FormField
                  control={form.control}
                  name='goal.target'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mục tiêu</FormLabel>
                      <Select
                        key={profile?.id + '-goal-' + (field.value ?? '')}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
                            <SelectValue placeholder='Chọn mục tiêu' />
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
              </div>
            </form>
          </Form>
        </div>

        {/* Macro Configuration */}
        <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
          <div className='mb-6'>
            <h2 className='text-lg font-semibold'>Mục tiêu vi chất</h2>
            <p className='text-sm'>
              Cấu hình vi chất dinh dưỡng hàng ngày của bạn
            </p>
          </div>

          {/* Macro Mode Selection */}
          <div className='mb-6'>
            <label className='text-sm font-medium mb-2 block'>
              Tính toán macro
            </label>
            <Select value={macroMode} onValueChange={setMacroMode}>
              <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='auto'>Tự động tính vi chất</SelectItem>
                <SelectItem value='manual'>Nhập vi chất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {macroMode === 'auto' ? (
            <div className='space-y-4'>
              {/* Display current calculated values */}
              {profile?.nutritionTarget?.caloriesTarget && (
                <div className='bg-muted/50 rounded-xl p-4'>
                  <p className='text-sm font-semibold mb-2'>
                    Mục tiêu hiện tại
                  </p>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span>Calories:</span>
                      <span className='font-semibold ml-2'>
                        {profile.nutritionTarget.caloriesTarget} kcal/day
                      </span>
                    </div>
                    {currentMacros && (
                      <>
                        <div>
                          <span className='text-muted-foreground'>Carbs:</span>
                          <span className='font-semibold ml-2'>
                            {currentMacros.carbs?.min}-
                            {currentMacros.carbs?.max}g
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            Protein:
                          </span>
                          <span className='font-semibold ml-2'>
                            {currentMacros.protein?.min}-
                            {currentMacros.protein?.max}g
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Fat:</span>
                          <span className='font-semibold ml-2'>
                            {currentMacros.fat?.min}-{currentMacros.fat?.max}g
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <Button
                type='button'
                onClick={handleCalculate}
                disabled={isCalculating || isUpdating}
                className='w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
              >
                {isCalculating || isUpdating ? (
                  <Spinner className='h-4 w-4 mr-2' />
                ) : (
                  <Calculator className='h-4 w-4 mr-2' />
                )}
                Recalculate Nutrition Target
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <div className='space-y-6'>
                {/* Manual Macro Sliders */}
                <div className='space-y-6'>
                  {/* Carbs */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <label className='text-sm font-medium'>
                        <span className='inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2'></span>
                        Carbs
                      </label>
                      <div className='flex items-center gap-2 text-sm'>
                        <Input
                          type='number'
                          value={
                            form.watch('nutritionTarget.macros.carbs.min') || 7
                          }
                          onChange={e =>
                            form.setValue(
                              'nutritionTarget.macros.carbs.min',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className='w-16 h-8 text-center rounded-md'
                        />
                        <span>to</span>
                        <Input
                          type='number'
                          value={
                            form.watch('nutritionTarget.macros.carbs.max') || 83
                          }
                          onChange={e =>
                            form.setValue(
                              'nutritionTarget.macros.carbs.max',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className='w-16 h-8 text-center rounded-md'
                        />
                        <span>g</span>
                      </div>
                    </div>
                    <Slider
                      value={[
                        form.watch('nutritionTarget.macros.carbs.min') || 7,
                        form.watch('nutritionTarget.macros.carbs.max') || 83
                      ]}
                      onValueChange={([min, max]) => {
                        form.setValue('nutritionTarget.macros.carbs.min', min);
                        form.setValue('nutritionTarget.macros.carbs.max', max);
                      }}
                      min={0}
                      max={300}
                      step={1}
                      className='[&_[role=slider]]:bg-yellow-500 [&_[role=slider]]:border-yellow-600'
                    />
                  </div>

                  {/* Fats */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <label className='text-sm font-medium'>
                        <span className='inline-block w-2 h-2 rounded-full bg-cyan-500 mr-2'></span>
                        Fats
                      </label>
                      <div className='flex items-center gap-2 text-sm'>
                        <Input
                          type='number'
                          value={
                            form.watch('nutritionTarget.macros.fat.min') || 12
                          }
                          onChange={e =>
                            form.setValue(
                              'nutritionTarget.macros.fat.min',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className='w-16 h-8 text-center rounded-md'
                        />
                        <span>to</span>
                        <Input
                          type='number'
                          value={
                            form.watch('nutritionTarget.macros.fat.max') || 37
                          }
                          onChange={e =>
                            form.setValue(
                              'nutritionTarget.macros.fat.max',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className='w-16 h-8 text-center rounded-md'
                        />
                        <span>g</span>
                      </div>
                    </div>
                    <Slider
                      value={[
                        form.watch('nutritionTarget.macros.fat.min') || 12,
                        form.watch('nutritionTarget.macros.fat.max') || 37
                      ]}
                      onValueChange={([min, max]) => {
                        form.setValue('nutritionTarget.macros.fat.min', min);
                        form.setValue('nutritionTarget.macros.fat.max', max);
                      }}
                      min={0}
                      max={150}
                      step={1}
                      className='[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-600'
                    />
                  </div>

                  {/* Protein */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <label className='text-sm font-medium'>
                        <span className='inline-block w-2 h-2 rounded-full bg-purple-500 mr-2'></span>
                        Protein
                      </label>
                      <div className='flex items-center gap-2 text-sm'>
                        <Input
                          type='number'
                          value={
                            form.watch('nutritionTarget.macros.protein.min') ||
                            13
                          }
                          onChange={e =>
                            form.setValue(
                              'nutritionTarget.macros.protein.min',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className='w-16 h-8 text-center rounded-md'
                        />
                        <span>to</span>
                        <Input
                          type='number'
                          value={
                            form.watch('nutritionTarget.macros.protein.max') ||
                            83
                          }
                          onChange={e =>
                            form.setValue(
                              'nutritionTarget.macros.protein.max',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className='w-16 h-8 text-center rounded-md'
                        />
                        <span>g</span>
                      </div>
                    </div>
                    <Slider
                      value={[
                        form.watch('nutritionTarget.macros.protein.min') || 13,
                        form.watch('nutritionTarget.macros.protein.max') || 83
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
                      max={300}
                      step={1}
                      className='[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-600'
                    />
                  </div>
                </div>

                <Button
                  type='button'
                  onClick={form.handleSubmit(handleSave)}
                  disabled={isUpdating}
                  className='w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
                >
                  {isUpdating ? (
                    <Spinner className='h-4 w-4 mr-2' />
                  ) : (
                    <Save className='h-4 w-4 mr-2' />
                  )}
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
