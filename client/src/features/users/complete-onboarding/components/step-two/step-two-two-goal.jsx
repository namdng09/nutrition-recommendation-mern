import React from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { USER_TARGET_OPTIONS } from '~/constants/user-target';

export function StepTwoTwoGoal({ control }) {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Mục tiêu của bạn</h3>
        <p className='text-muted-foreground text-sm'>
          Chọn mục tiêu dinh dưỡng phù hợp với bạn
        </p>
      </div>

      <FormField
        control={control}
        name='goal.target'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Mục tiêu <span className='text-destructive'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn mục tiêu của bạn' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {USER_TARGET_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
