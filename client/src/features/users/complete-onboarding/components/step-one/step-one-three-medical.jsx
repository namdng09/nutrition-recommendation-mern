import React from 'react';
import { Controller } from 'react-hook-form';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

export function StepOneThreeMedical({ control }) {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Tiền sử bệnh lý</h3>
        <p className='text-muted-foreground text-sm'>
          Cho chúng tôi biết về tiền sử bệnh lý của bạn (nếu có)
        </p>
      </div>

      <Controller
        control={control}
        name='medicalHistory'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tiền sử bệnh lý (Tùy chọn)</FormLabel>
            <FormControl>
              <Input
                className='w-full'
                placeholder='Nhập các tiền sử bệnh lý, cách nhau bởi dấu phẩy'
                value={field.value?.join(', ') || ''}
                onChange={e => {
                  const value = e.target.value;
                  field.onChange(
                    value ? value.split(',').map(v => v.trim()) : []
                  );
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
