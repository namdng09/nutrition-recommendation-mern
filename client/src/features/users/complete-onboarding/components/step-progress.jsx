import { ArrowLeftIcon, ArrowRightIcon, LoaderIcon } from 'lucide-react';
import React from 'react';

import { Button } from '~/components/ui/button';

export function StepProgress({
  currentStep,
  totalSteps,
  currentSubStep = 1,
  totalSubSteps = 1,
  onNext,
  onPrevious,
  isPending,
  isLastStep
}) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

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

            {/* Breakpoint markers */}
            <div className='absolute inset-0 flex justify-between'>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className='relative flex items-center justify-center'
                  style={{
                    width:
                      index === 0 || index === totalSteps - 1 ? '0' : 'auto'
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

          {/* Sub-step indicator */}
          <div className='text-muted-foreground text-sm'>
            Bước {currentSubStep}/{totalSubSteps}
          </div>

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
