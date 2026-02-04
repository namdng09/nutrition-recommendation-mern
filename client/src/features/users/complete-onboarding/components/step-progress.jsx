import { ArrowLeftIcon, ArrowRightIcon, LoaderIcon } from 'lucide-react';
import React from 'react';

import { Button } from '~/components/ui/button';

export function StepProgress({
  currentStep,
  totalSteps,
  currentSubStep = 1,
  step3MealCount = 0,
  onNext,
  onPrevious,
  isPending,
  isLastStep
}) {
  if (currentStep === 4) return null;

  const getTotalSubStepsForStep = step => {
    switch (step) {
      case 0:
        return 1;
      case 1:
      case 2:
        return 3;
      case 3:
        return 1 + step3MealCount;
      default:
        return 1;
    }
  };

  const calculateProgress = () => {
    const sectionSize = 100 / totalSteps;
    const currentStepProgress = Math.max(0, (currentStep - 1) * sectionSize);
    const currentSubStepProgress =
      currentStep === 0
        ? 0
        : ((currentSubStep - 1) / getTotalSubStepsForStep(currentStep)) *
          sectionSize;

    return currentStepProgress + currentSubStepProgress;
  };

  const progressPercentage = calculateProgress();

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg'>
      <div className='mx-auto w-full max-w-5xl px-4 py-4'>
        <div className='mb-4'>
          <div className='relative h-1'>
            <div className='absolute inset-0 bg-muted rounded-full' />

            <div
              className='absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out'
              style={{ width: `${progressPercentage}%` }}
            />

            <div className='absolute inset-0'>
              {Array.from({ length: totalSteps - 1 }).map((_, index) => (
                <div
                  key={index}
                  className='absolute'
                  style={{
                    left: `${((index + 1) / totalSteps) * 100}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className='size-3 rounded-full bg-primary border-2 border-background' />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex justify-between items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onPrevious}
            disabled={
              (currentStep === 1 && currentSubStep === 1) ||
              currentStep === 0 ||
              isPending
            }
            className={`text-base ${currentStep === 0 ? 'invisible' : ''}`}
          >
            <ArrowLeftIcon />
            Quay lại
          </Button>

          {!isLastStep ? (
            <Button
              type='button'
              onClick={onNext}
              disabled={isPending}
              className='text-base'
            >
              {currentStep === 0 ? 'Bắt đầu ngay' : 'Tiếp theo'}
              <ArrowRightIcon />
            </Button>
          ) : (
            <Button
              type='button'
              onClick={onNext}
              disabled={isPending}
              className='text-base'
            >
              {isPending ? (
                <>
                  <LoaderIcon className='animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                'Hoàn thành'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
