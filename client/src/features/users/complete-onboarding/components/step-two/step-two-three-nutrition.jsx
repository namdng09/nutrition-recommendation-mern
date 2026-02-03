import { Calculator } from 'lucide-react';
import React, { useEffect } from 'react';
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
    <div className='space-y-6 max-w-2xl mx-auto'>
      <div className='space-y-1.5'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Mục tiêu dinh dưỡng
        </h1>
        <p className='text-muted-foreground text-lg'>
          Chúng tôi sẽ điều chỉnh mục tiêu dinh dưỡng hàng ngày phù hợp với mục
          tiêu của bạn
        </p>
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
                    onChange={e =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
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
                <span className='text-lg font-bold tracking-tight'>Carbs</span>
              </div>
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
                  className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                />
                <span className='text-muted-foreground text-xs font-medium'>
                  đến
                </span>
                <Input
                  type='number'
                  value={watch('nutritionTarget.macros.carbs.max') || 0}
                  onChange={e =>
                    setValue(
                      'nutritionTarget.macros.carbs.max',
                      parseInt(e.target.value) || 0
                    )
                  }
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
                <span className='text-lg font-bold tracking-tight'>Fats</span>
              </div>
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
                  className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                />
                <span className='text-muted-foreground text-xs font-medium'>
                  đến
                </span>
                <Input
                  type='number'
                  value={watch('nutritionTarget.macros.fat.max') || 0}
                  onChange={e =>
                    setValue(
                      'nutritionTarget.macros.fat.max',
                      parseInt(e.target.value) || 0
                    )
                  }
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
                  Protein
                </span>
              </div>
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
                  className='w-16 h-9 text-center text-sm font-bold rounded-lg border-border bg-muted/30'
                />
                <span className='text-muted-foreground text-xs font-medium'>
                  đến
                </span>
                <Input
                  type='number'
                  value={watch('nutritionTarget.macros.protein.max') || 0}
                  onChange={e =>
                    setValue(
                      'nutritionTarget.macros.protein.max',
                      parseInt(e.target.value) || 0
                    )
                  }
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
  );
}
