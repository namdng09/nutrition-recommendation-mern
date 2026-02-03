import { Beef, Calculator, Droplet, Save, Target, Wheat } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Slider } from '~/components/ui/slider';
import { Spinner } from '~/components/ui/spinner';
import { cn } from '~/lib/utils';

import { useCalculateNutritionTarget } from '../../api/use-calculate-nutrition-target';
import { cleanGoalData } from '../../utils/clean-goal-data';

export function StepTwoThreeNutrition({ control, watch, setValue }) {
  const { mutate: calculateTarget, isPending } = useCalculateNutritionTarget();
  const formData = watch();

  const handleCalculate = () => {
    const requestData = {
      diet: formData.diet,
      gender: formData.gender,
      height: formData.height,
      weight: formData.weight,
      bodyfat: formData.bodyfat,
      activityLevel: formData.activityLevel,
      dob: formData.dob,
      goal: cleanGoalData(formData.goal),
      allergens: formData.allergens
    };

    calculateTarget(requestData, {
      onSuccess: data => {
        const calculated = data.data;
        setValue('nutritionTarget', calculated);
        toast.success('Đã tính toán mục tiêu dinh dưỡng thành công!');
      },
      onError: error => {
        toast.error('Không thể tính toán mục tiêu dinh dưỡng');
        console.error(error);
      }
    });
  };

  useEffect(() => {
    // Initial calculation if values are 0
    if (formData.nutritionTarget.caloriesTarget === 0) {
      handleCalculate();
    }
  }, []);

  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h2 className='text-3xl font-bold tracking-tight'>
            Mục tiêu dinh dưỡng
          </h2>
          <p className='text-muted-foreground text-lg'>
            Tùy chỉnh mục tiêu dinh dưỡng hàng ngày của bạn
          </p>
        </div>
        <Button
          type='button'
          onClick={handleCalculate}
          disabled={isPending}
          variant='outline'
          size='lg'
          className='rounded-xl h-12 px-6'
        >
          {isPending ? (
            <Spinner className='h-5 w-5 mr-2' />
          ) : (
            <Calculator className='h-5 w-5 mr-2' />
          )}
          <span className='text-base font-semibold'>Tính toán tự động</span>
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Calories Card */}
        <div className='lg:col-span-5 space-y-6'>
          <div className='rounded-3xl border border-border bg-card p-8 shadow-sm h-full flex flex-col justify-center'>
            <div className='mb-8 text-center'>
              <div className='inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4'>
                <Target className='h-8 w-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold'>Mục tiêu Calo</h3>
              <p className='text-muted-foreground'>
                Năng lượng nạp vào mỗi ngày
              </p>
            </div>

            <FormField
              control={control}
              name='nutritionTarget.caloriesTarget'
              render={({ field }) => (
                <FormItem className='space-y-4'>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type='number'
                        className='h-24 text-center text-5xl font-bold rounded-3xl border-2 focus-visible:ring-primary/20 bg-muted/30 pb-4'
                        {...field}
                        onChange={e =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                      <span className='absolute bottom-4 left-1/2 -translate-x-1/2 text-muted-foreground font-medium'>
                        kcal / ngày
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Macros Card */}
        <div className='lg:col-span-7'>
          <div className='rounded-3xl border border-border bg-card p-8 shadow-sm'>
            <div className='mb-8'>
              <h3 className='text-xl font-semibold'>Mục tiêu Macros</h3>
              <p className='text-muted-foreground'>
                Tỉ lệ đạm, béo và tinh bột
              </p>
            </div>

            <div className='space-y-10'>
              {/* Protein */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <FormLabel className='text-lg font-semibold flex items-center gap-2'>
                    <div className='p-1.5 rounded-lg bg-chart-2/10'>
                      <Beef className='h-5 w-5 text-chart-2' />
                    </div>
                    Đạm (Protein)
                  </FormLabel>
                  <div className='flex items-center gap-3'>
                    <Input
                      type='number'
                      value={watch('nutritionTarget.macros.protein.min') || 0}
                      onChange={e =>
                        setValue(
                          'nutritionTarget.macros.protein.min',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='w-20 h-10 text-center text-lg font-medium rounded-xl border-border'
                    />
                    <span className='text-muted-foreground font-medium'>-</span>
                    <Input
                      type='number'
                      value={watch('nutritionTarget.macros.protein.max') || 0}
                      onChange={e =>
                        setValue(
                          'nutritionTarget.macros.protein.max',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='w-20 h-10 text-center text-lg font-medium rounded-xl border-border'
                    />
                    <span className='text-muted-foreground font-semibold'>
                      g
                    </span>
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
                  className='[&_[role=slider]]:bg-chart-2 [&_[role=slider]]:border-chart-2'
                />
              </div>

              {/* Fats */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <FormLabel className='text-lg font-semibold flex items-center gap-2'>
                    <div className='p-1.5 rounded-lg bg-chart-4/10'>
                      <Droplet className='h-5 w-5 text-chart-4' />
                    </div>
                    Chất béo (Fats)
                  </FormLabel>
                  <div className='flex items-center gap-3'>
                    <Input
                      type='number'
                      value={watch('nutritionTarget.macros.fat.min') || 0}
                      onChange={e =>
                        setValue(
                          'nutritionTarget.macros.fat.min',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='w-20 h-10 text-center text-lg font-medium rounded-xl border-border'
                    />
                    <span className='text-muted-foreground font-medium'>-</span>
                    <Input
                      type='number'
                      value={watch('nutritionTarget.macros.fat.max') || 0}
                      onChange={e =>
                        setValue(
                          'nutritionTarget.macros.fat.max',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='w-20 h-10 text-center text-lg font-medium rounded-xl border-border'
                    />
                    <span className='text-muted-foreground font-semibold'>
                      g
                    </span>
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
                  className='[&_[role=slider]]:bg-chart-4 [&_[role=slider]]:border-chart-4'
                />
              </div>

              {/* Carbs */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <FormLabel className='text-lg font-semibold flex items-center gap-2'>
                    <div className='p-1.5 rounded-lg bg-chart-1/10'>
                      <Wheat className='h-5 w-5 text-chart-1' />
                    </div>
                    Tinh bột (Carbs)
                  </FormLabel>
                  <div className='flex items-center gap-3'>
                    <Input
                      type='number'
                      value={watch('nutritionTarget.macros.carbs.min') || 0}
                      onChange={e =>
                        setValue(
                          'nutritionTarget.macros.carbs.min',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='w-20 h-10 text-center text-lg font-medium rounded-xl border-border'
                    />
                    <span className='text-muted-foreground font-medium'>-</span>
                    <Input
                      type='number'
                      value={watch('nutritionTarget.macros.carbs.max') || 0}
                      onChange={e =>
                        setValue(
                          'nutritionTarget.macros.carbs.max',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='w-20 h-10 text-center text-lg font-medium rounded-xl border-border'
                    />
                    <span className='text-muted-foreground font-semibold'>
                      g
                    </span>
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
                  className='[&_[role=slider]]:bg-chart-1 [&_[role=slider]]:border-chart-1'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
