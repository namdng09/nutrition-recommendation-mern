import React from 'react';
import { Controller } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue
} from '~/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { ALLERGEN_GROUPS } from '~/constants/allergen';
import { DIET_OPTIONS } from '~/constants/diet';

export function StepOneDiet({ control }) {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Chế độ ăn của bạn</h3>
        <p className='text-muted-foreground text-sm'>
          Cho chúng tôi biết về chế độ ăn và các dị ứng thực phẩm của bạn
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

      <Controller
        control={control}
        name='allergens'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dị ứng thực phẩm</FormLabel>
            <MultiSelect
              value={field.value || []}
              onValueChange={field.onChange}
            >
              <FormControl>
                <MultiSelectTrigger className='w-full'>
                  <MultiSelectValue placeholder='Chọn các loại thực phẩm bạn dị ứng' />
                </MultiSelectTrigger>
              </FormControl>
              <MultiSelectContent>
                {ALLERGEN_GROUPS.map(group => (
                  <MultiSelectGroup
                    key={group.category}
                    heading={group.category}
                  >
                    {group.options.map(option => (
                      <MultiSelectItem key={option.value} value={option.value}>
                        {option.label}
                      </MultiSelectItem>
                    ))}
                  </MultiSelectGroup>
                ))}
              </MultiSelectContent>
            </MultiSelect>
            <FormMessage />
          </FormItem>
        )}
      />

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
