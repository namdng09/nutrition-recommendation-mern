import { Sandwich } from 'lucide-react';
import React from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { DIET_OPTIONS } from '~/constants/diet';
import { cn } from '~/lib/utils';

export function StepOneOneDiet({ control }) {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Bạn muốn ăn gì?</h3>
        <p className='text-muted-foreground text-sm'>
          Chọn một loại chế độ ăn chính. Bạn có thể loại trừ các thực phẩm cụ
          thể ở bước tiếp theo.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left Column - Decorative Illustration */}
        <div className='hidden lg:flex lg:col-span-5 flex-col items-center justify-center p-8'>
          <div className='relative flex items-center justify-center'>
            <Sandwich
              size={240}
              strokeWidth={1}
              className='text-primary relative z-10'
            />
          </div>
        </div>

        {/* Right Column - Diet Options List */}
        <div className='col-span-1 lg:col-span-7'>
          <div className='max-h-[60vh] lg:max-h-none overflow-y-auto lg:overflow-visible'>
            <FormField
              control={control}
              name='diet'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <div className='flex flex-col gap-2'>
                    {DIET_OPTIONS.map(option => {
                      const isSelected = field.value === option.value;
                      const Icon = option.icon;

                      return (
                        <div
                          key={option.value}
                          className={cn(
                            'relative flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent/50',
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          )}
                          onClick={() => field.onChange(option.value)}
                        >
                          {/* Radio Indicator */}
                          <div className='mr-3 shrink-0 mt-0.5'>
                            <div
                              className={cn(
                                'h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center',
                                isSelected
                                  ? 'border-primary'
                                  : 'border-muted-foreground'
                              )}
                            >
                              {isSelected && (
                                <div className='h-1.5 w-1.5 rounded-full bg-primary' />
                              )}
                            </div>
                          </div>

                          {/* Icon */}
                          <div className='mr-3 shrink-0'>
                            <Icon className='w-6 h-6' />
                          </div>

                          {/* Content */}
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-semibold text-base text-foreground mb-1'>
                              {option.label}
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {option.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
