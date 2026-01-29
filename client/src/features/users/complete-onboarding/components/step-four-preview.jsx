import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';

import { useCalculateNutritionTarget } from '../api/use-calculate-nutrition-target';

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
            <h4 className='mb-4 text-lg font-semibold'>
              🎯 Mục tiêu dinh dưỡng hàng ngày
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

                  {/* Carbs */}
                  <div className='space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span className='font-medium'>🍚 Carbs</span>
                      <span>
                        {calculatedTarget.macros.carbs.min}g -{' '}
                        {calculatedTarget.macros.carbs.max}g
                      </span>
                    </div>
                    <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
                      <div
                        className='h-full bg-blue-500'
                        style={{
                          width: `${(calculatedTarget.macros.carbs.max / (calculatedTarget.macros.carbs.max + calculatedTarget.macros.protein.max + calculatedTarget.macros.fat.max)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Protein */}
                  <div className='space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span className='font-medium'>🥩 Protein</span>
                      <span>
                        {calculatedTarget.macros.protein.min}g -{' '}
                        {calculatedTarget.macros.protein.max}g
                      </span>
                    </div>
                    <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
                      <div
                        className='h-full bg-green-500'
                        style={{
                          width: `${(calculatedTarget.macros.protein.max / (calculatedTarget.macros.carbs.max + calculatedTarget.macros.protein.max + calculatedTarget.macros.fat.max)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Fat */}
                  <div className='space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span className='font-medium'>🥑 Chất béo</span>
                      <span>
                        {calculatedTarget.macros.fat.min}g -{' '}
                        {calculatedTarget.macros.fat.max}g
                      </span>
                    </div>
                    <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
                      <div
                        className='h-full bg-yellow-500'
                        style={{
                          width: `${(calculatedTarget.macros.fat.max / (calculatedTarget.macros.carbs.max + calculatedTarget.macros.protein.max + calculatedTarget.macros.fat.max)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Info Summary */}
          <div className='border-input rounded-lg border p-6'>
            <h4 className='mb-4 text-lg font-semibold'>📋 Thông tin của bạn</h4>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Tuổi:</span>
                <span className='ml-2 font-medium'>{calculateAge()} tuổi</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Chiều cao:</span>
                <span className='ml-2 font-medium'>{formData.height} cm</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Cân nặng:</span>
                <span className='ml-2 font-medium'>{formData.weight} kg</span>
              </div>
              <div>
                <span className='text-muted-foreground'>BMI:</span>
                <span className='ml-2 font-medium'>{calculateBMI()}</span>
              </div>
              <div className='col-span-2'>
                <span className='text-muted-foreground'>Số bữa ăn:</span>
                <span className='ml-2 font-medium'>
                  {formData.mealSettings?.length || 0} bữa/ngày
                </span>
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
