import { CheckCircle2, Circle } from 'lucide-react';
import React from 'react';

import { cn } from '~/lib/utils';

const STEPS = [
  { id: 1, label: 'Chế độ ăn', description: 'Sở thích ăn uống' },
  { id: 2, label: 'Về bạn', description: 'Thông tin cá nhân' },
  { id: 3, label: 'Mục tiêu', description: 'Mục tiêu & Bữa ăn' },
  { id: 4, label: 'Xem trước', description: 'Xem lại & Hoàn tất' }
];

export function ProgressIndicator({ currentStep }) {
  return (
    <div className='w-full py-6'>
      <div className='flex items-center justify-between'>
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className='flex flex-1 flex-col items-center'>
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border-2 transition-all',
                  currentStep >= step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 bg-background text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className='size-6' />
                ) : (
                  <Circle
                    className={cn(
                      'size-6',
                      currentStep === step.id && 'fill-current'
                    )}
                  />
                )}
              </div>
              <div className='mt-2 text-center'>
                <p
                  className={cn(
                    'text-sm font-medium',
                    currentStep >= step.id
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {step.description}
                </p>
              </div>
            </div>

            {index < STEPS.length - 1 && (
              <div className='flex-1 px-4'>
                <div
                  className={cn(
                    'mt-5 h-0.5 w-full transition-colors',
                    currentStep > step.id
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
