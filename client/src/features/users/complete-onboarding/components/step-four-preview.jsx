import { Beef, ClipboardList, Droplet, Target, Wheat } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';

import { useCalculateNutritionTarget } from '../api/use-calculate-nutrition-target';

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
      <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
        <div
          className={cn('h-full', config.bgClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Reusable InfoItem component
function InfoItem({ label, value }) {
  return (
    <div>
      <span className='text-muted-foreground'>{label}:</span>
      <span className='ml-2 font-medium'>{value}</span>
    </div>
  );
}

export function StepFourPreview({ formData, onBack }) {
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
      },
      onError: error => {
        toast.error('Không thể tính toán mục tiêu dinh dưỡng');
        console.error(error);
      }
    });
  }, []);

  const calculateBMI = () => {
    const heightInMeters = formData.height / 100;
    return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateAge = () => {
    if (!formData.dob) return 0;
    const today = new Date();
    const birthDate = new Date(formData.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const calculateMacroPercentage = (macroMax, totalMax) => {
    return ((macroMax / totalMax) * 100).toFixed(1);
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Xem trước & Hoàn tất</h3>
        <p className='text-muted-foreground text-sm'>
          Xem lại mục tiêu dinh dưỡng được tính toán và xác nhận thông tin
        </p>
      </div>

      {isPending ? (
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-48 w-full' />
        </div>
      ) : (
        <>
          {/* Nutrition Target Summary */}
          <div className='border-input rounded-lg border bg-muted/50 p-6'>
            <h4 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
              <Target className='size-5 text-primary' />
              Mục tiêu dinh dưỡng hàng ngày
            </h4>
            {calculatedTarget && (
              <div className='space-y-4'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-3xl font-bold text-primary'>
                    {calculatedTarget.caloriesTarget}
                  </span>
                  <span className='text-muted-foreground'>kcal/ngày</span>
                </div>

                <div className='space-y-3'>
                  <h5 className='text-sm font-medium'>Phân bổ Macros:</h5>

                  {/* Calculate total max for percentages */}
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
            )}
          </div>

          {/* User Info Summary */}
          <div className='border-input rounded-lg border p-6'>
            <h4 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
              <ClipboardList className='size-5' />
              Thông tin của bạn
            </h4>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <InfoItem label='Tuổi' value={`${calculateAge()} tuổi`} />
              <InfoItem label='Chiều cao' value={`${formData.height} cm`} />
              <InfoItem label='Cân nặng' value={`${formData.weight} kg`} />
              <InfoItem label='BMI' value={calculateBMI()} />
              <div className='col-span-2'>
                <InfoItem
                  label='Số bữa ăn'
                  value={`${formData.mealSettings?.length || 0} bữa/ngày`}
                />
              </div>
            </div>
          </div>

          {/* Edit Options */}
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onBack(1)}
              className='flex-1'
            >
              Chỉnh sửa chế độ ăn
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => onBack(2)}
              className='flex-1'
            >
              Chỉnh sửa thông tin
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => onBack(3)}
              className='flex-1'
            >
              Chỉnh sửa mục tiêu
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
