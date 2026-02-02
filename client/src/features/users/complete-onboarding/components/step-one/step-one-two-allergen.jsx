import React from 'react';
import { Controller } from 'react-hook-form';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue
} from '~/components/ui/multi-select';
import { ALLERGEN_GROUPS } from '~/constants/allergen';

export function StepOneTwoAllergen({ control }) {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Dị ứng thực phẩm</h3>
        <p className='text-muted-foreground text-sm'>
          Cho chúng tôi biết về các dị ứng thực phẩm của bạn
        </p>
      </div>

      <Controller
        control={control}
        name='allergens'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dị ứng thực phẩm</FormLabel>
            <MultiSelect
              values={field.value || []}
              onValuesChange={field.onChange}
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
    </div>
  );
}
