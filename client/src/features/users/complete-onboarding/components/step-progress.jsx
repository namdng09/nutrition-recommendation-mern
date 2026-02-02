import { ArrowLeftIcon, ArrowRightIcon, LoaderIcon } from 'lucide-react';
import React from 'react';

import { Button } from '~/components/ui/button';

export function StepProgress({
  currentStep,
  totalSteps,
  currentSubStep = 1,
  totalSubSteps = 1,
  step3MealCount = 0,
  onNext,
  onPrevious,
  isPending,
  isLastStep
}) {
  // Calculate progress based on both main steps and sub-steps
  const getTotalSubStepsForStep = step => {
    switch (step) {
      case 1:
      case 2:
        return 3;
      case 3:
        // Dynamic: 1 (list view) + number of meals (detail views)
        return 1 + step3MealCount;
      default:
        return 1;
    }
  };

  // Calculate progress proportionally within each step's section
  const calculateProgress = () => {
    const sectionSize = 100 / totalSteps; // Each step gets equal section (33.33% for 3 steps)
    const currentStepProgress = (currentStep - 1) * sectionSize; // Start of current section
    const currentSubStepProgress =
      ((currentSubStep - 1) / getTotalSubStepsForStep(currentStep)) *
      sectionSize;

    return currentStepProgress + currentSubStepProgress;
  };

  const progressPercentage = calculateProgress();

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg'>
      <div className='mx-auto w-full max-w-5xl px-6 py-5'>
        {/* Segmented progress bar with breakpoints */}
        <div className='mb-4'>
          <div className='relative h-1'>
            {/* Background bar */}
            <div className='absolute inset-0 bg-muted rounded-full' />

            {/* Progress fill */}
            <div
              className='absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out'
              style={{ width: `${progressPercentage}%` }}
            />

            {/* Breakpoint markers - only middle points */}
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

        {/* Navigation buttons */}
        <div className='flex justify-between items-center'>
          <Button
            type='button'
            variant='outline'
            onClick={onPrevious}
            disabled={(currentStep === 1 && currentSubStep === 1) || isPending}
            className='text-base'
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
              Tiếp theo
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
