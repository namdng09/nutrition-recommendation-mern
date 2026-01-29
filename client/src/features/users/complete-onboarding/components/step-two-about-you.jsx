import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';

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

export function StepTwoAboutYou({ control }) {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Về bạn</h3>
        <p className='text-muted-foreground text-sm'>
          Cung cấp thông tin cá nhân để chúng tôi tính toán nhu cầu dinh dưỡng
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={control}
          name='gender'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Giới tính <span className='text-destructive'>*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn giới tính' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GENDER_OPTIONS.map(option => (
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

        <FormField
          control={control}
          name='dob'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Ngày sinh <span className='text-destructive'>*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'dd/MM/yyyy')
                      ) : (
                        <span>Chọn ngày sinh</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-60' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    captionLayout='dropdown'
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={date => {
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                    }}
                    disabled={date =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    defaultMonth={
                      field.value ? new Date(field.value) : new Date(2000, 0)
                    }
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='height'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Chiều cao (cm) <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='170'
                  className='w-full'
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='weight'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Cân nặng (kg) <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='65'
                  className='w-full'
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='bodyfat'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mức độ mỡ cơ thể <span className='text-destructive'>*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn mức độ mỡ' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BODYFAT_OPTIONS.map(option => (
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

        <FormField
          control={control}
          name='activityLevel'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mức độ hoạt động <span className='text-destructive'>*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn mức độ hoạt động' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACTIVITY_LEVEL_OPTIONS.map(option => (
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
    </div>
  );
}
