import { Activity } from 'lucide-react';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { MEDICAL_HISTORY_OPTIONS } from '~/constants/medical';
import { cn } from '~/lib/utils';

export function StepOneThreeMedical({ control }) {
  return (
    <div className='space-y-6'>
      <title>Tiền sử bệnh</title>
      <meta
        name='description'
        content='Cung cấp thông tin về tiền sử bệnh lý của bạn.'
      />
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Tiền sử bệnh lý</h3>
        <p className='text-muted-foreground'>
          Cho chúng tôi biết về tiền sử bệnh lý của bạn để tối ưu hóa thực đơn
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-4 h-full'>
        <div className='hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-4 min-h-[400px]'>
          <div className='relative flex items-center justify-center'>
            <Activity
              size={180}
              strokeWidth={1}
              className='text-primary relative z-10 opacity-80'
            />
          </div>
        </div>

        <div className='w-full lg:w-3/5'>
          <Controller
            control={control}
            name='medicalHistory'
            render={({ field }) => {
              const currentValues = field.value || [];

              // Helper for predefined options
              const toggleOption = optionValue => {
                if (currentValues.includes(optionValue)) {
                  field.onChange(currentValues.filter(v => v !== optionValue));
                } else {
                  field.onChange([...currentValues, optionValue]);
                }
              };

              return (
                <FormItem>
                  <FormLabel className='sr-only'>Tiền sử bệnh lý</FormLabel>
                  <FormControl>
                    <div className='space-y-4'>
                      <OtherMedicalInput
                        value={currentValues}
                        onChange={field.onChange}
                      />

                      <div className='space-y-2'>
                        <h4 className='text-base font-medium text-primary'>
                          Các bệnh lý phổ biến
                        </h4>
                        <div className='grid grid-cols-2 lg:grid-cols-3 gap-2'>
                          {MEDICAL_HISTORY_OPTIONS.map(option => {
                            const isSelected = currentValues.includes(
                              option.value
                            );
                            return (
                              <button
                                key={option.value}
                                type='button'
                                onClick={() => toggleOption(option.value)}
                                className={cn(
                                  'relative flex flex-col items-center justify-start p-2 rounded-xl border-2 transition-all duration-200 h-auto',
                                  isSelected
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-transparent bg-secondary/30 hover:bg-secondary/60 hover:border-primary/20'
                                )}
                              >
                                <div className='relative w-full h-26 rounded-lg overflow-hidden bg-background shadow-sm shrink-0 mb-1'>
                                  <img
                                    src={option.image}
                                    alt={option.label}
                                    className='w-full h-full object-cover'
                                  />
                                </div>
                                <span
                                  className={cn(
                                    'text-sm font-bold text-center leading-tight w-full px-1',
                                    isSelected
                                      ? 'text-primary'
                                      : 'text-foreground/80'
                                  )}
                                  style={{ textWrap: 'pretty' }}
                                >
                                  {option.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

function OtherMedicalInput({ value, onChange }) {
  const [inputValue, setInputValue] = useState(() => {
    const otherValues = value.filter(
      v => !MEDICAL_HISTORY_OPTIONS.some(opt => opt.value === v)
    );
    return otherValues.join(', ');
  });

  const handleChange = e => {
    const newVal = e.target.value;
    setInputValue(newVal);

    const newOthers = newVal
      ? newVal
          .split(',')
          .map(v => v.trim())
          .filter(v => v !== '')
      : [];

    // Keep predefined ones, replace others
    const predefinedOnes = value.filter(v =>
      MEDICAL_HISTORY_OPTIONS.some(opt => opt.value === v)
    );

    // Remove duplicates if any
    const uniqueNewOthers = [...new Set(newOthers)];

    onChange([...predefinedOnes, ...uniqueNewOthers]);
  };

  return (
    <div className='space-y-2'>
      <h4 className='text-base font-medium text-primary'>
        Bệnh lý khác (nếu có)
      </h4>
      <Input
        className='w-full'
        placeholder='Nhập bệnh lý khác, cách nhau bởi dấu phẩy'
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
}
