import { Calculator } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Slider } from '~/components/ui/slider';
import { Spinner } from '~/components/ui/spinner';

import { useCalculateNutritionTarget } from '../../api/use-calculate-nutrition-target';
import { cleanGoalData } from '../../utils/clean-goal-data';

export function StepTwoThreeNutrition({ control, watch, setValue }) {
  const { mutate: calculateTarget, isPending } = useCalculateNutritionTarget();
  const { getValues } = useFormContext();
  const [isEditing, setIsEditing] = useState(false);

  const nutritionTarget = watch('nutritionTarget');
  const calories = nutritionTarget?.caloriesTarget || 0;
  const macros = nutritionTarget?.macros || {
    carbs: { min: 0, max: 0 },
    fat: { min: 0, max: 0 },
    protein: { min: 0, max: 0 }
  };

  const handleCalculate = () => {
    const values = getValues();
    const requestData = {
      diet: values.diet,
      gender: values.gender,
      height: parseFloat(values.height) || 0,
      weight: parseFloat(values.weight) || 0,
      bodyfat: values.bodyfat,
      activityLevel: values.activityLevel,
      dob: values.dob,
      goal: cleanGoalData(values.goal),
      allergens: values.allergens
    };

    calculateTarget(requestData, {
      onSuccess: data => {
        const calculated = data.data;
        if (calculated) {
          setValue('nutritionTarget', calculated, { shouldDirty: true });
          const successMsg =
            data.message || 'Đã tính toán mục tiêu dinh dưỡng thành công!';
          toast.success(successMsg);
        }
      },
      onError: error => {
        const errorMsg = error?.response?.data?.message || error.message;
        toast.error(errorMsg);
        console.error('Step 2.3: Calculation Error:', errorMsg);
      }
    });
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <div className='space-y-6'>
      <title>Dinh dưỡng</title>
      <meta
        name='description'
        content='Xem và điều chỉnh mục tiêu dinh dưỡng hàng ngày.'
      />
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Mục tiêu dinh dưỡng</h3>
        <p className='text-muted-foreground'>
          Chúng tôi sẽ điều chỉnh mục tiêu dinh dưỡng hàng ngày phù hợp với mục
          tiêu của bạn
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left Column - Icon */}
        <div className='hidden lg:flex lg:w-2/5 flex-col items-center justify-start p-4 pt-20 sticky top-0 h-fit'>
          <div className='relative flex items-center justify-center'>
            <Calculator
              size={180}
              strokeWidth={1}
              className='text-primary relative z-10 opacity-80'
            />
          </div>
        </div>

        {/* Right Column - Form */}
        <div className='w-full lg:w-3/5 space-y-6'>
          {!isEditing ? (
            /* Summary View */
            <div className='pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300'>
              <div className='space-y-1'>
                <div className='text-2xl font-bold'>
                  {calories} Calories mỗi ngày
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center gap-3 text-lg'>
                    <div className='size-3 rounded-full bg-chart-1 shadow-[0_0_8px_rgba(var(--chart-1),0.6)]' />
                    <span className='font-medium'>
                      {macros.carbs.min} - {macros.carbs.max}g Tinh bột
                    </span>
                  </div>
                  <div className='flex items-center gap-3 text-lg'>
                    <div className='size-3 rounded-full bg-chart-2 shadow-[0_0_8px_rgba(var(--chart-2),0.6)]' />
                    <span className='font-medium'>
                      {macros.fat.min} - {macros.fat.max}g Chất béo
                    </span>
                  </div>
                  <div className='flex items-center gap-3 text-lg'>
                    <div className='size-3 rounded-full bg-chart-3 shadow-[0_0_8px_rgba(var(--chart-3),0.6)]' />
                    <span className='font-medium'>
                      {macros.protein.min} - {macros.protein.max}g Chất đạm
                    </span>
                  </div>
                </div>
              </div>

              <div className='pt-2'>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant='outline'
                  className='rounded-full px-6 border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                >
                  Chỉnh sửa mục tiêu
                </Button>
              </div>
            </div>
          ) : (
            /* Edit View */
            <div className='space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300'>
              <div className='flex justify-start'>
                <Button onClick={() => setIsEditing(false)}>
                  Chỉnh sửa xong
                </Button>
              </div>

              {/* Calories Row */}
              <div className='flex items-center justify-between py-2'>
                <h3 className='text-xl font-bold'>Calories</h3>
                <FormField
                  control={control}
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
                                field.onChange(val === '' ? 0 : parseInt(val));
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

              <div className='h-px bg-border/60' />

              {/* Target Macros Section */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between py-1.5 border-b border-border/40'>
                  <span className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                    Tính toán vi chất
                  </span>
                  <Button
                    type='button'
                    onClick={handleCalculate}
                    disabled={isPending}
                    variant='ghost'
                    size='sm'
                    className='h-8 text-primary hover:text-primary/80 hover:bg-primary/5 px-2 font-bold'
                  >
                    {isPending ? (
                      <Spinner className='h-3 w-3 mr-2' />
                    ) : (
                      <Calculator className='h-3 w-3 mr-2' />
                    )}
                    <span className='text-xs underline underline-offset-4 decoration-2'>
                      Tự động tính lại
                    </span>
                  </Button>
                </div>

                <div className='space-y-8 pt-2'>
                  {/* Carbs */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='size-2.5 rounded-full bg-chart-1 shadow-[0_0_8px_rgba(var(--chart-1),0.5)]' />
                        <span className='text-lg font-bold tracking-tight'>
                          Tinh bột
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Input
                          type='text'
                          value={watch('nutritionTarget.macros.carbs.min') || 0}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setValue(
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
                          value={watch('nutritionTarget.macros.carbs.max') || 0}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setValue(
                                'nutritionTarget.macros.carbs.max',
                                val === '' ? 0 : parseInt(val)
                              );
                            }
                          }}
                          className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                        />
                        <span className='font-bold text-[17px]'>g</span>
                      </div>
                    </div>
                    <Slider
                      value={[
                        watch('nutritionTarget.macros.carbs.min') || 0,
                        watch('nutritionTarget.macros.carbs.max') || 0
                      ]}
                      onValueChange={([min, max]) => {
                        setValue('nutritionTarget.macros.carbs.min', min);
                        setValue('nutritionTarget.macros.carbs.max', max);
                      }}
                      min={0}
                      max={600}
                      step={1}
                      className='**:[[role=slider]]:bg-chart-1 **:[[role=slider]]:border-chart-1'
                    />
                  </div>

                  {/* Fats */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='size-2.5 rounded-full bg-chart-2 shadow-[0_0_8px_rgba(var(--chart-2),0.5)]' />
                        <span className='text-lg font-bold tracking-tight'>
                          Chất béo
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Input
                          type='text'
                          value={watch('nutritionTarget.macros.fat.min') || 0}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setValue(
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
                          value={watch('nutritionTarget.macros.fat.max') || 0}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setValue(
                                'nutritionTarget.macros.fat.max',
                                val === '' ? 0 : parseInt(val)
                              );
                            }
                          }}
                          className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                        />
                        <span className='font-bold text-[17px]'>g</span>
                      </div>
                    </div>
                    <Slider
                      value={[
                        watch('nutritionTarget.macros.fat.min') || 0,
                        watch('nutritionTarget.macros.fat.max') || 0
                      ]}
                      onValueChange={([min, max]) => {
                        setValue('nutritionTarget.macros.fat.min', min);
                        setValue('nutritionTarget.macros.fat.max', max);
                      }}
                      min={0}
                      max={200}
                      step={1}
                      className='**:[[role=slider]]:bg-chart-2 **:[[role=slider]]:border-chart-2'
                    />
                  </div>

                  {/* Protein */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='size-2.5 rounded-full bg-chart-3 shadow-[0_0_8px_rgba(var(--chart-3),0.5)]' />
                        <span className='text-lg font-bold tracking-tight'>
                          Chất đạm
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Input
                          type='text'
                          value={
                            watch('nutritionTarget.macros.protein.min') || 0
                          }
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setValue(
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
                            watch('nutritionTarget.macros.protein.max') || 0
                          }
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setValue(
                                'nutritionTarget.macros.protein.max',
                                val === '' ? 0 : parseInt(val)
                              );
                            }
                          }}
                          className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                        />
                        <span className='font-bold text-[17px]'>g</span>
                      </div>
                    </div>
                    <Slider
                      value={[
                        watch('nutritionTarget.macros.protein.min') || 0,
                        watch('nutritionTarget.macros.protein.max') || 0
                      ]}
                      onValueChange={([min, max]) => {
                        setValue('nutritionTarget.macros.protein.min', min);
                        setValue('nutritionTarget.macros.protein.max', max);
                      }}
                      min={0}
                      max={400}
                      step={1}
                      className='**:[[role=slider]]:bg-chart-3 **:[[role=slider]]:border-chart-3'
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
