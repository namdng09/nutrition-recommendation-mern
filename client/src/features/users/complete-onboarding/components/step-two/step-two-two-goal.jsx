import { Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { USER_TARGET, USER_TARGET_OPTIONS } from '~/constants/user-target';
import { cn } from '~/lib/utils';

export function StepTwoTwoGoal({ control }) {
  const { setValue, getValues } = useFormContext();
  const mode = useWatch({ control, name: 'goal.mode' });

  const currentWeight = useWatch({ control, name: 'weight' });
  const goalTarget = useWatch({ control, name: 'goal.target' });
  const weightGoal = useWatch({ control, name: 'goal.weightGoal' });

  useEffect(() => {
    const hasSpecificGoal =
      getValues('goal.weightGoal') || getValues('goal.targetWeightChange');
    if (hasSpecificGoal && mode === 'generic') {
      setValue('goal.mode', 'exact');
    }
  }, []);

  const handleModeChange = newMode => {
    setValue('goal.mode', newMode);
    // Don't clear values when switching modes to persist data
  };

  // Inference Logic for Exact Mode - only run when values change
  useEffect(() => {
    if (mode === 'exact' && weightGoal && currentWeight) {
      let target;
      const wGoal = parseFloat(weightGoal);
      const wCurrent = parseFloat(currentWeight);

      if (isNaN(wGoal) || isNaN(wCurrent)) return;

      if (wGoal < wCurrent) target = USER_TARGET.LOSE_FAT;
      else if (wGoal > wCurrent) target = USER_TARGET.BUILD_MUSCLE;
      else target = USER_TARGET.MAINTAIN_WEIGHT;

      if (target !== goalTarget) {
        setValue('goal.target', target);
      }
    }
  }, [mode, weightGoal, currentWeight, setValue, goalTarget]);

  // Clean up exact mode values when switching to generic is NOT desired behavior anymore based on user request (implied by "lost target value" when switching).
  // However, we might want to "clean" data before submission, not during UI toggling.

  return (
    <div className='space-y-6'>
      <title>Mục tiêu</title>
      <meta
        name='description'
        content='Đặt mục tiêu sức khỏe và cân nặng của bạn.'
      />
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Mục tiêu của bạn</h3>
        <p className='text-muted-foreground'>
          Chúng tôi sẽ điều chỉnh mục tiêu dinh dưỡng hàng ngày phù hợp với mục
          tiêu của bạn
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left Column - Icon */}
        <div className='hidden lg:flex lg:w-2/5 flex-col items-center justify-start p-4 pt-20 sticky top-0 h-fit'>
          <div className='relative flex items-center justify-center'>
            <Target
              size={180}
              strokeWidth={1}
              className='text-primary relative z-10 opacity-80'
            />
          </div>
        </div>

        {/* Right Column - Form */}
        <div className='w-full lg:w-3/5 space-y-6'>
          {/* Mode Toggle */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0'>
            <FormLabel className='text-lg'>Thiết lập mục tiêu</FormLabel>
            <div className='flex items-center gap-2 w-full sm:w-auto'>
              <button
                type='button'
                onClick={() => handleModeChange('generic')}
                className={cn(
                  'flex-1 sm:flex-none px-4 py-2 rounded-lg border text-base font-medium transition-all duration-200',
                  mode === 'generic'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-transparent bg-secondary/50 text-foreground hover:bg-secondary/80 hover:border-border/50'
                )}
              >
                Mục tiêu chung
              </button>
              <button
                type='button'
                onClick={() => handleModeChange('exact')}
                className={cn(
                  'flex-1 sm:flex-none px-4 py-2 rounded-lg border text-base font-medium transition-all duration-200',
                  mode === 'exact'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-transparent bg-secondary/50 text-foreground hover:bg-secondary/80 hover:border-border/50'
                )}
              >
                Mục tiêu cụ thể
              </button>
            </div>
          </div>

          {/* Generic Target - Row Layout */}
          {mode === 'generic' && (
            <FormField
              control={control}
              name='goal.target'
              render={({ field }) => (
                <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                  <FormLabel className='text-lg'>
                    Tôi muốn <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end'>
                      {USER_TARGET_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type='button'
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            'px-4 py-2 rounded-lg border text-base font-medium transition-all duration-200 flex-1 sm:flex-none whitespace-nowrap',
                            field.value === option.value
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-transparent bg-secondary/50 text-foreground hover:bg-secondary/80 hover:border-border/50'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Specific Goal Fields - Row Layouts */}
          {mode === 'exact' && (
            <div className='space-y-6 pt-4 border-t'>
              {/* Exact Goal Fields */}
              <FormField
                control={control}
                name='goal.weightGoal'
                render={({ field }) => (
                  <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                    <div className='flex flex-col gap-1 lg:min-w-[140px]'>
                      <FormLabel className='text-lg'>
                        Cân nặng mục tiêu{' '}
                        <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormMessage className='text-xs text-destructive' />
                    </div>
                    <div className='w-full lg:w-[200px] flex justify-start lg:justify-end'>
                      <div className='flex items-center gap-2 w-full'>
                        <FormControl>
                          <Input
                            type='text'
                            className='flex-1 lg:w-24 lg:flex-none text-center text-base h-11'
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <span className='text-base text-muted-foreground w-8'>
                          kg
                        </span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='goal.targetWeightChange'
                render={({ field }) => (
                  <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                    <div className='flex flex-col gap-1 lg:min-w-[140px]'>
                      <FormLabel className='text-lg'>
                        Tốc độ thay đổi{' '}
                        <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormMessage className='text-xs text-destructive' />
                    </div>
                    <div className='w-full lg:w-[200px] flex justify-start lg:justify-end'>
                      <div className='flex items-center gap-2 w-full'>
                        <FormControl>
                          <Input
                            type='text'
                            className='flex-1 lg:w-24 lg:flex-none text-center text-base h-11'
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <span className='text-base text-muted-foreground w-16 text-right'>
                          kg/tuần
                        </span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
