import { format } from 'date-fns';
import { CalendarIcon, User } from 'lucide-react';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

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

const DEV_DEFAULT_VALUES = {
  dob: '2000-01-08',
  height: 170,
  weight: 60
};

export function StepTwoOnePhysical({ control }) {
  const { setValue, getValues } = useFormContext();

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

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-3xl font-bold'>Thông tin cơ thể</h3>
        <p className='text-muted-foreground text-base'>
          Cung cấp thông tin cơ thể để tính toán nhu cầu dinh dưỡng
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-6 h-full'>
        {/* Left Column - Image/Icon */}
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
              <FormItem className='flex flex-row items-center justify-between space-y-0'>
                <FormLabel className='text-lg min-w-[140px]'>
                  Giới tính <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='w-[280px]'>
                  <div className='flex space-x-2'>
                    {GENDER_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex-1 px-3 py-3 rounded-md transition-colors border text-base font-medium',
                          field.value === option.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted border-input text-foreground'
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
              <FormItem className='flex flex-row items-center justify-between space-y-0'>
                <div className='flex flex-col gap-1 min-w-[140px]'>
                  <FormLabel className='text-lg'>
                    Chiều cao (cm) <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormMessage className='text-xs text-destructive' />
                </div>
                <div className='w-[280px] flex justify-end'>
                  <div className='flex items-center gap-2'>
                    <FormControl>
                      <Input
                        type='text'
                        className='w-20 text-center text-base h-11'
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
              <FormItem className='flex flex-row items-center justify-between space-y-0'>
                <div className='flex flex-col gap-1 min-w-[140px]'>
                  <FormLabel className='text-lg'>
                    Cân nặng (kg) <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormMessage className='text-xs text-destructive' />
                </div>
                <div className='w-[280px] flex justify-end'>
                  <div className='flex items-center gap-2'>
                    <FormControl>
                      <Input
                        type='text'
                        className='w-20 text-center text-base h-11'
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
              <FormItem className='flex flex-row items-center justify-between space-y-0'>
                <FormLabel className='text-lg min-w-[140px]'>
                  Ngày sinh <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='w-[280px]'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full pl-3 text-left font-normal text-base h-11',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'dd/MM/yyyy')
                          ) : (
                            <span>Chọn ngày sinh</span>
                          )}
                          <CalendarIcon className='ml-auto h-5 w-5 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='end'>
                      <Calendar
                        mode='single'
                        captionLayout='dropdown'
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={date => {
                          field.onChange(
                            date ? format(date, 'yyyy-MM-dd') : ''
                          );
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
              <FormItem className='flex flex-row items-center justify-between space-y-0'>
                <FormLabel className='text-lg min-w-[140px]'>
                  Tỷ lệ mỡ <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='w-[280px]'>
                  <div className='flex space-x-2'>
                    {BODYFAT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex-1 px-3 py-3 rounded-md transition-colors border text-base font-medium whitespace-nowrap',
                          field.value === option.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted border-input text-foreground'
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

          {/* Activity Level */}
          <FormField
            control={control}
            name='activityLevel'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between space-y-0'>
                <FormLabel className='text-lg min-w-[140px]'>
                  Hoạt động <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='flex-1 ml-6'>
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
