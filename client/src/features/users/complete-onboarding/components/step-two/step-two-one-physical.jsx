import { format, isValid, parse } from 'date-fns';
import { CalendarIcon, User } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { ACTIVITY_LEVEL_OPTIONS } from '~/constants/activity-level';
import { BODYFAT_OPTIONS } from '~/constants/bodyfat';
import { GENDER_OPTIONS } from '~/constants/gender';
import { cn } from '~/lib/utils';

import { calculateBMI, getDisabledBodyFatOptions } from '../../utils/bmi';

const DEV_DEFAULT_VALUES = {
  dob: '2000-01-08',
  height: 170,
  weight: 60
};

export function StepTwoOnePhysical({ control }) {
  const { setValue, getValues } = useFormContext();

  // Watch values for BMI calculation
  const height = useWatch({ control, name: 'height' });
  const weight = useWatch({ control, name: 'weight' });
  const bodyfat = useWatch({ control, name: 'bodyfat' });

  // Calculate disabled body fat options
  const disabledBodyFatOptions = useMemo(() => {
    const bmi = calculateBMI(parseFloat(height), parseFloat(weight));
    return getDisabledBodyFatOptions(bmi);
  }, [height, weight]);

  // Effect to deselect invalid body fat option
  useEffect(() => {
    if (bodyfat && disabledBodyFatOptions.has(bodyfat)) {
      setValue('bodyfat', undefined);
    }
  }, [disabledBodyFatOptions, bodyfat, setValue]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const currentValues = getValues();
      if (!currentValues.gender) setValue('gender', DEV_DEFAULT_VALUES.gender);
      if (!currentValues.dob) setValue('dob', DEV_DEFAULT_VALUES.dob);
      if (!currentValues.height) setValue('height', DEV_DEFAULT_VALUES.height);
      if (!currentValues.weight) setValue('weight', DEV_DEFAULT_VALUES.weight);
      if (!currentValues.bodyfat)
        setValue('bodyfat', DEV_DEFAULT_VALUES.bodyfat);
      if (!currentValues.activityLevel)
        setValue('activityLevel', DEV_DEFAULT_VALUES.activityLevel);
    }
  }, [setValue, getValues]);

  // State for DOB input string
  const [dobInput, setDobInput] = useState('');

  // Sync internal input state with form value on mount or external change
  useEffect(() => {
    const dobValue = getValues('dob');
    if (dobValue) {
      setDobInput(format(new Date(dobValue), 'dd/MM/yyyy'));
    }
  }, [getValues('dob')]);

  const handleDateInputChange = e => {
    const value = e.target.value;
    setDobInput(value);

    // Parse input: dd/MM/yyyy
    const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate) && value.length === 10) {
      // Check bounds
      if (parsedDate <= new Date() && parsedDate >= new Date('1900-01-01')) {
        setValue('dob', format(parsedDate, 'yyyy-MM-dd'), {
          shouldValidate: true
        });
      }
    }
  };

  return (
    <div className='space-y-6'>
      <title>Chỉ số cơ thể</title>
      <meta
        name='description'
        content='Nhập chiều cao, cân nặng và các chỉ số cơ thể khác.'
      />
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Thông tin cơ thể</h3>
        <p className='text-muted-foreground text-base'>
          Cung cấp thông tin cơ thể để tính toán nhu cầu dinh dưỡng
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left Column - Image/Icon - Hidden on mobile */}
        <div className='hidden lg:flex lg:w-2/5 flex-col items-center justify-center min-h-[350px]'>
          <div className='relative flex items-center justify-center'>
            <User
              size={180}
              strokeWidth={1}
              className='text-primary relative z-10 opacity-80'
            />
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className='w-full lg:w-3/5 space-y-6'>
          {/* Sex */}
          <FormField
            control={control}
            name='gender'
            render={({ field }) => (
              <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                <FormLabel className='text-lg lg:min-w-[140px]'>
                  Giới tính <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='w-full lg:w-[280px]'>
                  <div className='flex gap-2'>
                    {GENDER_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg border text-base font-medium transition-all duration-200',
                          field.value === option.value
                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                            : 'border-transparent bg-secondary/50 text-foreground hover:bg-secondary/80 hover:border-border/50'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <FormMessage className='text-right mt-1' />
                </div>
              </FormItem>
            )}
          />

          {/* Height */}
          <FormField
            control={control}
            name='height'
            render={({ field }) => (
              <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                <div className='flex flex-col gap-1 lg:min-w-[140px]'>
                  <FormLabel className='text-lg'>
                    Chiều cao (cm) <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormMessage className='text-xs text-destructive' />
                </div>
                <div className='w-full lg:w-[280px] flex justify-start lg:justify-end'>
                  <div className='flex items-center gap-2 w-full'>
                    <FormControl>
                      <Input
                        type='text'
                        className='flex-1 lg:w-20 lg:flex-none text-center text-base h-11'
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
                    <span className='text-base text-muted-foreground'>cm</span>
                  </div>
                </div>
              </FormItem>
            )}
          />

          {/* Weight */}
          <FormField
            control={control}
            name='weight'
            render={({ field }) => (
              <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                <div className='flex flex-col gap-1 lg:min-w-[140px]'>
                  <FormLabel className='text-lg'>
                    Cân nặng (kg) <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormMessage className='text-xs text-destructive' />
                </div>
                <div className='w-full lg:w-[280px] flex justify-start lg:justify-end'>
                  <div className='flex items-center gap-2 w-full'>
                    <FormControl>
                      <Input
                        type='text'
                        className='flex-1 lg:w-20 lg:flex-none text-center text-base h-11'
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
                    <span className='text-base text-muted-foreground'>kg</span>
                  </div>
                </div>
              </FormItem>
            )}
          />

          {/* DOB */}
          <FormField
            control={control}
            name='dob'
            render={({ field }) => (
              <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                <FormLabel className='text-lg lg:min-w-[140px]'>
                  Ngày sinh <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='w-full lg:w-[280px] relative'>
                  <div className='flex items-center gap-2'>
                    <FormControl>
                      <Input
                        type='text'
                        className='flex-1 h-11 text-base'
                        placeholder='DD/MM/YYYY'
                        value={dobInput}
                        onChange={handleDateInputChange}
                        maxLength={10}
                      />
                    </FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-11 h-11 p-0 flex items-center justify-center font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className='h-5 w-5 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='end'>
                        <Calendar
                          mode='single'
                          captionLayout='dropdown'
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={date => {
                            const formatted = date
                              ? format(date, 'yyyy-MM-dd')
                              : '';
                            field.onChange(formatted);
                            if (date) setDobInput(format(date, 'dd/MM/yyyy'));
                            else setDobInput('');
                          }}
                          disabled={date =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          defaultMonth={
                            field.value
                              ? new Date(field.value)
                              : new Date(2000, 0)
                          }
                          startMonth={new Date(1900, 0)}
                          endMonth={new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage className='text-right mt-1' />
                </div>
              </FormItem>
            )}
          />

          {/* Bodyfat */}
          <FormField
            control={control}
            name='bodyfat'
            render={({ field }) => (
              <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                <FormLabel className='text-lg lg:min-w-[140px]'>
                  Tỷ lệ mỡ <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='w-full lg:w-[280px]'>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    {BODYFAT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type='button'
                        disabled={disabledBodyFatOptions.has(option.value)}
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg border text-base font-medium transition-all duration-200 whitespace-nowrap',
                          field.value === option.value
                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                            : 'border-transparent bg-secondary/50 text-foreground hover:bg-secondary/80 hover:border-border/50',
                          disabledBodyFatOptions.has(option.value) &&
                            'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted hover:border-transparent'
                        )}
                        title={
                          disabledBodyFatOptions.has(option.value)
                            ? 'Chỉ số BMI của bạn không phù hợp với tùy chọn này'
                            : ''
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <FormMessage className='text-right mt-1' />
                </div>
              </FormItem>
            )}
          />

          {/* Activity Level */}
          <FormField
            control={control}
            name='activityLevel'
            render={({ field }) => (
              <FormItem className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0'>
                <FormLabel className='text-lg lg:min-w-[140px]'>
                  Hoạt động <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='w-full lg:flex-1 lg:ml-6'>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full h-auto py-3 text-base'>
                        <SelectValue
                          placeholder='Chọn mức độ hoạt động'
                          className='whitespace-normal text-left'
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent align='end'>
                      {ACTIVITY_LEVEL_OPTIONS.map(option => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className='text-base py-3'
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-right mt-1' />
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
