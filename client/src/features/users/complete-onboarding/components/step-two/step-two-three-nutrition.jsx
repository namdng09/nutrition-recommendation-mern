import { Beef, ClipboardList, Droplet, Target, Wheat } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';

import { useCalculateNutritionTarget } from '../../api/use-calculate-nutrition-target';

const MACRO_CONFIG = {
  carbs: {
    label: 'Carbs',
    icon: Wheat,
    colorClass: 'text-chart-1',
    bgClass: 'bg-chart-1'
  },
  protein: {
    label: 'Protein',
    icon: Beef,
    colorClass: 'text-chart-2',
    bgClass: 'bg-chart-2'
  },
  fat: {
    label: 'Chất béo',
    icon: Droplet,
    colorClass: 'text-chart-4',
    bgClass: 'bg-chart-4'
  }
};

function MacroDisplay({ type, min, max, percentage }) {
  const config = MACRO_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className='space-y-1'>
      <div className='flex justify-between text-sm'>
        <span className='flex items-center gap-1.5 font-medium'>
          <Icon className={cn('size-4', config.colorClass)} />
          {config.label}
        </span>
        <span>
          {min}g - {max}g
        </span>
      </div>
      <Progress
        value={percentage}
        className='h-2'
        indicatorClassName={config.bgClass}
      />
    </div>
  );
}

export function StepTwoThreeNutrition({ formData, setValue }) {
  const [calculatedTarget, setCalculatedTarget] = useState(null);
  const { mutate: calculateTarget, isPending } = useCalculateNutritionTarget();

  useEffect(() => {
    const requestData = {
      diet: formData.diet,
      gender: formData.gender,
      height: formData.height,
      weight: formData.weight,
      bodyfat: formData.bodyfat,
      activityLevel: formData.activityLevel,
      dob: formData.dob,
      goal: formData.goal,
      allergens: formData.allergens
    };

    calculateTarget(requestData, {
      onSuccess: data => {
        setCalculatedTarget(data.data);
        setValue('nutritionTarget', data.data);
        toast.success('Đã tính toán mục tiêu dinh dưỡng thành công!');
      },
      onError: error => {
        toast.error('Không thể tính toán mục tiêu dinh dưỡng');
        console.error(error);
      }
    });
  }, []);

  const calculateMacroPercentage = (macroMax, totalMax) => {
    return Number(((macroMax / totalMax) * 100).toFixed(1));
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Mục tiêu dinh dưỡng</h3>
        <p className='text-muted-foreground text-sm'>
          Mục tiêu dinh dưỡng được tính toán dựa trên thông tin của bạn
        </p>
      </div>

      {isPending ? (
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-48 w-full' />
        </div>
      ) : (
        <>
          {calculatedTarget && (
            <div className='border-input rounded-lg border bg-muted/50 p-6'>
              <h4 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
                <Target className='size-5 text-primary' />
                Mục tiêu dinh dưỡng hàng ngày
              </h4>
              <div className='space-y-4'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-3xl font-bold text-primary'>
                    {calculatedTarget.caloriesTarget}
                  </span>
                  <span className='text-muted-foreground'>kcal/ngày</span>
                </div>

                <div className='space-y-3'>
                  <h5 className='text-sm font-medium'>Phân bổ Macros:</h5>

                  {(() => {
                    const totalMax =
                      calculatedTarget.macros.carbs.max +
                      calculatedTarget.macros.protein.max +
                      calculatedTarget.macros.fat.max;

                    return (
                      <>
                        <MacroDisplay
                          type='carbs'
                          min={calculatedTarget.macros.carbs.min}
                          max={calculatedTarget.macros.carbs.max}
                          percentage={calculateMacroPercentage(
                            calculatedTarget.macros.carbs.max,
                            totalMax
                          )}
                        />
                        <MacroDisplay
                          type='protein'
                          min={calculatedTarget.macros.protein.min}
                          max={calculatedTarget.macros.protein.max}
                          percentage={calculateMacroPercentage(
                            calculatedTarget.macros.protein.max,
                            totalMax
                          )}
                        />
                        <MacroDisplay
                          type='fat'
                          min={calculatedTarget.macros.fat.min}
                          max={calculatedTarget.macros.fat.max}
                          percentage={calculateMacroPercentage(
                            calculatedTarget.macros.fat.max,
                            totalMax
                          )}
                        />
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
