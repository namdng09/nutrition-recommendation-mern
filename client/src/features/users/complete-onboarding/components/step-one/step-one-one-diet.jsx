import { Sandwich } from 'lucide-react';
import React from 'react';

import { FormField, FormItem, FormMessage } from '~/components/ui/form';
import { DIET_OPTIONS } from '~/constants/diet';
import { cn } from '~/lib/utils';

export function StepOneOneDiet({ control }) {
  return (
    <div className='space-y-6'>
      <title>Chế độ ăn</title>
      <meta name='description' content='Chọn chế độ ăn uống phù hợp với bạn.' />
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Bạn muốn ăn gì?</h3>
        <p className='text-muted-foreground'>
          Chọn một loại chế độ ăn chính. Bạn có thể loại trừ các thực phẩm cụ
          thể ở bước tiếp theo.
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-4'>
        <div className='hidden lg:flex lg:w-2/5 flex-col items-center justify-start p-4 pt-20 sticky top-0 h-fit'>
          <div className='relative flex items-center justify-center'>
            <Sandwich
              size={180}
              strokeWidth={1}
              className='text-primary relative z-10'
            />
          </div>
        </div>

        <div className='w-full lg:w-3/5'>
          <div className='flex flex-col gap-1'>
            <FormField
              control={control}
              name='diet'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <div className='flex flex-col gap-0'>
                    {DIET_OPTIONS.map(option => {
                      const isSelected = field.value === option.value;
                      const Icon = option.icon;

                      return (
                        <div
                          key={option.value}
                          className={cn(
                            'relative group flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-accent/40',
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-transparent hover:border-border/50'
                          )}
                          onClick={() => field.onChange(option.value)}
                        >
                          <div
                            className={cn(
                              'h-4 w-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0',
                              isSelected
                                ? 'border-primary'
                                : 'border-muted-foreground group-hover:border-primary/50'
                            )}
                          >
                            {isSelected && (
                              <div className='h-2 w-2 rounded-full bg-primary shadow-sm' />
                            )}
                          </div>

                          <Icon
                            className={cn(
                              'size-9 transition-colors flex-shrink-0',
                              isSelected
                                ? 'text-primary'
                                : 'text-muted-foreground/50 group-hover:text-muted-foreground/80'
                            )}
                            strokeWidth={1.5}
                          />

                          {/* Content */}
                          <div className='min-w-0 flex-1'>
                            <h4 className='font-medium text-lg leading-tight mb-0.5'>
                              {option.label}
                            </h4>
                            <p className='text-sm text-muted-foreground line-clamp-2'>
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
