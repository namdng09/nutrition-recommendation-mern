import { yupResolver } from '@hookform/resolvers/yup';
import { Calculator, Save, Target } from 'lucide-react';
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
import { USER_TARGET_OPTIONS } from '~/constants/user-target';
import {
  useCalculateNutrition,
  useUpdateNutritionTarget
} from '~/features/users/update-nutrition-target/api/update-nutrition-target';
import { updateNutritionTargetSchema } from '~/features/users/update-nutrition-target/schemas/update-nutrition-target-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';

export function UpdateNutritionTarget() {
  const { data: profile } = useProfileForPage();

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
        // Update form values with calculated macros
        if (calculated.macros) {
          form.setValue('nutritionTarget.macros.carbs', {
            min: calculated.macros.carbs?.min || 0,
            max: calculated.macros.carbs?.max || 0
          });
          form.setValue('nutritionTarget.macros.fat', {
            min: calculated.macros.fat?.min || 0,
            max: calculated.macros.fat?.max || 0
          });
          form.setValue('nutritionTarget.macros.protein', {
            min: calculated.macros.protein?.min || 0,
            max: calculated.macros.protein?.max || 0
          });
        }
        toast.success('Tính toán dinh dưỡng thành công');
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

  const handleSave = data => {
    updateNutritionTarget(data);
  };

  const handleCalculate = () => {
    const formData = form.getValues();
    const latestWeight =
      profile?.weightRecord?.length > 0
        ? profile.weightRecord
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight
        : 0;

    calculateNutrition({
      height: profile?.height,
      weight: latestWeight,
      bodyfat: profile?.bodyfat,
      activityLevel: profile?.activityLevel,
      goal: formData.goal,
      diet: profile?.diet,
      gender: profile?.gender,
      dob: profile?.dob,
      allergens: profile?.allergens
    });
  };

  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Target className='h-7 w-7' />
        <h1 className='text-2xl font-bold'>Mục tiêu dinh dưỡng</h1>
      </div>

      <div className='space-y-6'>
        {/* Goal Section */}
        <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
          <div className='mb-6'>
            <h2 className='text-lg font-semibold'>Mục tiêu</h2>
            <p className='text-sm'>Chọn mục tiêu dinh dưỡng của bạn</p>
          </div>

          <Form {...form}>
            <form className='space-y-6'>
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

          <Form {...form}>
            <div className='space-y-6'>
              {/* Calories Target */}
              <FormField
                control={form.control}
                name='nutritionTarget.caloriesTarget'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mục tiêu Calo (kcal)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='2000'
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

              {/* Macro Sliders */}
              <div className='space-y-6'>
                {/* Carbs */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm font-medium'>
                      <span className='inline-block w-2 h-2 rounded-full bg-chart-1 mr-2'></span>
                      Carbs
                    </label>
                    <div className='flex items-center gap-2 text-sm'>
                      <Input
                        type='number'
                        value={
                          form.watch('nutritionTarget.macros.carbs.min') || 0
                        }
                        onChange={e =>
                          form.setValue(
                            'nutritionTarget.macros.carbs.min',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className='w-16 h-8 text-center rounded-md'
                      />
                      <span>đến</span>
                      <Input
                        type='number'
                        value={
                          form.watch('nutritionTarget.macros.carbs.max') || 0
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
                      form.watch('nutritionTarget.macros.carbs.min') || 0,
                      form.watch('nutritionTarget.macros.carbs.max') || 0
                    ]}
                    onValueChange={([min, max]) => {
                      form.setValue('nutritionTarget.macros.carbs.min', min);
                      form.setValue('nutritionTarget.macros.carbs.max', max);
                    }}
                    min={0}
                    max={500}
                    step={1}
                    className='[&_[role=slider]]:bg-chart-1 [&_[role=slider]]:border-chart-1'
                  />
                </div>

                {/* Fats */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm font-medium'>
                      <span className='inline-block w-2 h-2 rounded-full bg-chart-2 mr-2'></span>
                      Fats
                    </label>
                    <div className='flex items-center gap-2 text-sm'>
                      <Input
                        type='number'
                        value={
                          form.watch('nutritionTarget.macros.fat.min') || 0
                        }
                        onChange={e =>
                          form.setValue(
                            'nutritionTarget.macros.fat.min',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className='w-16 h-8 text-center rounded-md'
                      />
                      <span>đến</span>
                      <Input
                        type='number'
                        value={
                          form.watch('nutritionTarget.macros.fat.max') || 0
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
                      form.watch('nutritionTarget.macros.fat.min') || 0,
                      form.watch('nutritionTarget.macros.fat.max') || 0
                    ]}
                    onValueChange={([min, max]) => {
                      form.setValue('nutritionTarget.macros.fat.min', min);
                      form.setValue('nutritionTarget.macros.fat.max', max);
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
                    <label className='text-sm font-medium'>
                      <span className='inline-block w-2 h-2 rounded-full bg-chart-3 mr-2'></span>
                      Protein
                    </label>
                    <div className='flex items-center gap-2 text-sm'>
                      <Input
                        type='number'
                        value={
                          form.watch('nutritionTarget.macros.protein.min') || 0
                        }
                        onChange={e =>
                          form.setValue(
                            'nutritionTarget.macros.protein.min',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className='w-16 h-8 text-center rounded-md'
                      />
                      <span>đến</span>
                      <Input
                        type='number'
                        value={
                          form.watch('nutritionTarget.macros.protein.max') || 0
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
                      form.watch('nutritionTarget.macros.protein.min') || 0,
                      form.watch('nutritionTarget.macros.protein.max') || 0
                    ]}
                    onValueChange={([min, max]) => {
                      form.setValue('nutritionTarget.macros.protein.min', min);
                      form.setValue('nutritionTarget.macros.protein.max', max);
                    }}
                    min={0}
                    max={500}
                    step={1}
                    className='[&_[role=slider]]:bg-chart-3 [&_[role=slider]]:border-chart-3'
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <Button
                  type='button'
                  onClick={handleCalculate}
                  disabled={isCalculating || isUpdating}
                  variant='outline'
                  className='flex-1 rounded-xl border-border hover:bg-muted'
                >
                  {isCalculating ? (
                    <Spinner className='h-4 w-4 mr-2' />
                  ) : (
                    <Calculator className='h-4 w-4 mr-2' />
                  )}
                  Tính toán lại
                </Button>

                <Button
                  type='button'
                  onClick={form.handleSubmit(handleSave)}
                  disabled={isUpdating}
                  className='flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
                >
                  {isUpdating ? (
                    <Spinner className='h-4 w-4 mr-2' />
                  ) : (
                    <Save className='h-4 w-4 mr-2' />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
