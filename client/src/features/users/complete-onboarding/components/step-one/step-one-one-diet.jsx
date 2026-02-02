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
import { DIET_OPTIONS } from '~/constants/diet';

export function StepOneOneDiet({ control }) {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Chế độ ăn của bạn</h3>
        <p className='text-muted-foreground text-sm'>
          Cho chúng tôi biết về chế độ ăn của bạn
        </p>
      </div>

      <FormField
        control={control}
        name='diet'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Chế độ ăn <span className='text-destructive'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn chế độ ăn của bạn' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DIET_OPTIONS.map(option => (
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
