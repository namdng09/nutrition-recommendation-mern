import { yupResolver } from '@hookform/resolvers/yup';
import { format, isValid, parse } from 'date-fns';
import { Activity, CalendarIcon, Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Form,
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
import { Separator } from '~/components/ui/separator';
import { Spinner } from '~/components/ui/spinner';
import { ACTIVITY_LEVEL_OPTIONS } from '~/constants/activity-level';
import { BODYFAT_OPTIONS } from '~/constants/bodyfat';
import { GENDER_OPTIONS } from '~/constants/gender';
import { MEDICAL_HISTORY_OPTIONS } from '~/constants/medical';
import { useUpdatePhysicalStats } from '~/features/users/update-physical-stats/api/update-physical-stats';
import { updatePhysicalStatsSchema } from '~/features/users/update-physical-stats/schemas/update-physical-stats-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { cn } from '~/lib/utils';

// BMI calculation utilities
const calculateBMI = (height, weight) => {
  if (!height || !weight || height <= 0 || weight <= 0) return null;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

const getDisabledBodyFatOptions = bmi => {
  const disabled = new Set();
  if (bmi === null) return disabled;

  if (bmi < 18.5) {
    disabled.add('Trung Bình');
    disabled.add('Cao');
  } else if (bmi >= 18.5 && bmi < 25) {
    // Normal weight - all options available
  } else if (bmi >= 25 && bmi < 30) {
    disabled.add('Thấp');
  } else if (bmi >= 30) {
    disabled.add('Thấp');
    disabled.add('Trung Bình');
  }

  return disabled;
};

const UpdatePhysicalStats = () => {
  const { data: profile } = useProfileForPage();
  const { mutate: updatePhysicalStats, isPending: isUpdating } =
    useUpdatePhysicalStats({
      onSuccess: response => {
        toast.success(response?.message || 'Cập nhật chỉ số cơ thể thành công');
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Cập nhật chỉ số cơ thể thất bại'
        );
      }
    });

  const form = useForm({
    resolver: yupResolver(updatePhysicalStatsSchema),
    values: profile
      ? {
          gender: profile.gender || '',
          dob: profile.dob ? profile.dob.split('T')[0] : '',
          height: profile.height || '',
          weight:
            profile.weightRecord?.length > 0
              ? profile.weightRecord
                  .slice()
                  .sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight
              : '',
          bodyfat: profile.bodyfat || '',
          activityLevel: profile.activityLevel || '',
          medicalHistory: profile.medicalHistory || []
        }
      : undefined
  });

  // Watch values for BMI calculation
  const height = useWatch({ control: form.control, name: 'height' });
  const weight = useWatch({ control: form.control, name: 'weight' });
  const bodyfat = useWatch({ control: form.control, name: 'bodyfat' });

  // Calculate disabled body fat options
  const disabledBodyFatOptions = useMemo(() => {
    const bmi = calculateBMI(parseFloat(height), parseFloat(weight));
    return getDisabledBodyFatOptions(bmi);
  }, [height, weight]);

  // Effect to deselect invalid body fat option
  useEffect(() => {
    if (bodyfat && disabledBodyFatOptions.has(bodyfat)) {
      form.setValue('bodyfat', '');
    }
  }, [disabledBodyFatOptions, bodyfat, form]);

  // State for DOB input string
  const [dobInput, setDobInput] = useState('');

  // State for other medical input - MOVED HERE
  const [otherInput, setOtherInput] = useState('');

  // Sync internal input state with form value on mount or external change
  useEffect(() => {
    const dobValue = form.getValues('dob');
    if (dobValue) {
      setDobInput(format(new Date(dobValue), 'dd/MM/yyyy'));
    }
  }, [form]);

  // Sync other input with medical history on mount/change
  useEffect(() => {
    const medicalHistory = form.getValues('medicalHistory') || [];
    const otherValues = medicalHistory.filter(
      v => !MEDICAL_HISTORY_OPTIONS.some(opt => opt.value === v)
    );
    setOtherInput(otherValues.join(', '));
  }, [form, profile]);

  const handleDateInputChange = e => {
    const value = e.target.value;
    setDobInput(value);

    // Parse input: dd/MM/yyyy
    const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate) && value.length === 10) {
      // Check bounds
      if (parsedDate <= new Date() && parsedDate >= new Date('1900-01-01')) {
        form.setValue('dob', format(parsedDate, 'yyyy-MM-dd'), {
          shouldValidate: true
        });
      }
    }
  };

  const handleSave = data => {
    updatePhysicalStats(data);
  };

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Activity className='h-5 w-5 text-primary' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Chỉ số cơ thể
            </h1>
          </div>
          <p className='text-sm text-muted-foreground sm:text-base'>
            Cập nhật các chỉ số cơ thể của bạn để tính toán nhu cầu dinh dưỡng
            chính xác hơn
          </p>
        </div>

        {/* Form Card */}
        <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className=''>
              {/* Form Content */}
              <div className='space-y-0'>
                {/* Basic Information Section */}
                <div className='p-6 space-y-6'>
                  <div className='space-y-1'>
                    <h3 className='text-base font-semibold'>
                      Thông tin cơ bản
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Các thông tin cơ bản về cơ thể của bạn
                    </p>
                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8'>
                    {/* Left Column - Avatar */}
                    <div className='hidden lg:flex items-center justify-center'>
                      <div className='relative'>
                        <Avatar className='h-48 w-48 ring-4 ring-primary/10'>
                          <AvatarImage
                            src={profile?.avatar}
                            alt={profile?.name}
                            className='object-cover'
                          />
                          <AvatarFallback className='text-6xl font-semibold bg-primary/5 text-primary'>
                            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className='space-y-5 min-w-0'>
                      {/* Gender */}
                      <FormField
                        control={form.control}
                        name='gender'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                            <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                              Giới tính{' '}
                              <span className='text-destructive'>*</span>
                            </FormLabel>
                            <div className='space-y-2'>
                              <div className='grid grid-cols-3 gap-2'>
                                {GENDER_OPTIONS.map(option => (
                                  <button
                                    key={option.value}
                                    type='button'
                                    onClick={() => field.onChange(option.value)}
                                    className={cn(
                                      'px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200',
                                      field.value === option.value
                                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                    )}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Height */}
                      <FormField
                        control={form.control}
                        name='height'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                            <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                              Chiều cao (cm){' '}
                              <span className='text-destructive'>*</span>
                            </FormLabel>
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2 max-w-[200px]'>
                                <FormControl>
                                  <Input
                                    type='text'
                                    className='text-center tabular-nums'
                                    placeholder='170'
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (
                                        value === '' ||
                                        /^\d*\.?\d*$/.test(value)
                                      ) {
                                        field.onChange(value);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <span className='text-sm text-muted-foreground whitespace-nowrap'>
                                  cm
                                </span>
                              </div>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Weight */}
                      <FormField
                        control={form.control}
                        name='weight'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                            <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                              Cân nặng (kg){' '}
                              <span className='text-destructive'>*</span>
                            </FormLabel>
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2 max-w-[200px]'>
                                <FormControl>
                                  <Input
                                    type='text'
                                    className='text-center tabular-nums'
                                    placeholder='60'
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (
                                        value === '' ||
                                        /^\d*\.?\d*$/.test(value)
                                      ) {
                                        field.onChange(value);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <span className='text-sm text-muted-foreground whitespace-nowrap'>
                                  kg
                                </span>
                              </div>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* DOB */}
                      <FormField
                        control={form.control}
                        name='dob'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                            <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                              Ngày sinh{' '}
                              <span className='text-destructive'>*</span>
                            </FormLabel>
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2 max-w-[280px]'>
                                <FormControl>
                                  <Input
                                    type='text'
                                    className='flex-1 tabular-nums'
                                    placeholder='DD/MM/YYYY'
                                    value={dobInput}
                                    onChange={handleDateInputChange}
                                    maxLength={10}
                                  />
                                </FormControl>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type='button'
                                      variant='outline'
                                      size='icon'
                                      className={cn(
                                        'shrink-0',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      <CalendarIcon className='h-4 w-4' />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className='w-auto p-0'
                                    align='start'
                                  >
                                    <Calendar
                                      mode='single'
                                      captionLayout='dropdown'
                                      selected={
                                        field.value
                                          ? new Date(field.value)
                                          : undefined
                                      }
                                      onSelect={date => {
                                        const formatted = date
                                          ? format(date, 'yyyy-MM-dd')
                                          : '';
                                        field.onChange(formatted);
                                        if (date)
                                          setDobInput(
                                            format(date, 'dd/MM/yyyy')
                                          );
                                        else setDobInput('');
                                      }}
                                      disabled={date =>
                                        date > new Date() ||
                                        date < new Date('1900-01-01')
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
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Bodyfat */}
                      <FormField
                        control={form.control}
                        name='bodyfat'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                            <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                              Tỷ lệ mỡ{' '}
                              <span className='text-destructive'>*</span>
                            </FormLabel>
                            <div className='space-y-2'>
                              <div className='grid grid-cols-3 gap-2'>
                                {BODYFAT_OPTIONS.map(option => (
                                  <button
                                    key={option.value}
                                    type='button'
                                    disabled={disabledBodyFatOptions.has(
                                      option.value
                                    )}
                                    onClick={() => field.onChange(option.value)}
                                    className={cn(
                                      'px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 whitespace-nowrap',
                                      field.value === option.value
                                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
                                      disabledBodyFatOptions.has(
                                        option.value
                                      ) &&
                                        'opacity-40 cursor-not-allowed bg-muted hover:bg-muted hover:text-muted-foreground'
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
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Activity Level */}
                      <FormField
                        control={form.control}
                        name='activityLevel'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                            <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                              Hoạt động{' '}
                              <span className='text-destructive'>*</span>
                            </FormLabel>
                            <div className='space-y-2'>
                              <Select
                                key={
                                  profile?.id +
                                  '-activityLevel-' +
                                  (field.value ?? '')
                                }
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className=''>
                                    <SelectValue placeholder='Chọn mức độ hoạt động' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ACTIVITY_LEVEL_OPTIONS.map(option => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Medical History Section */}
                <div className='p-6 space-y-6'>
                  <div className='space-y-1'>
                    <h3 className='text-base font-semibold flex items-center gap-2'>
                      <Heart className='h-5 w-5 text-red-500' />
                      Tiền sử bệnh lý
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Cho chúng tôi biết về tiền sử bệnh lý của bạn để tối ưu
                      hóa thực đơn
                    </p>
                  </div>

                  <Controller
                    control={form.control}
                    name='medicalHistory'
                    render={({ field }) => {
                      const currentValues = field.value || [];

                      const toggleOption = optionValue => {
                        if (currentValues.includes(optionValue)) {
                          field.onChange(
                            currentValues.filter(v => v !== optionValue)
                          );
                        } else {
                          field.onChange([...currentValues, optionValue]);
                        }
                      };

                      const handleOtherChange = e => {
                        const newVal = e.target.value;
                        setOtherInput(newVal);

                        const newOthers = newVal
                          ? newVal
                              .split(',')
                              .map(v => v.trim())
                              .filter(v => v !== '')
                          : [];

                        const predefinedOnes = currentValues.filter(v =>
                          MEDICAL_HISTORY_OPTIONS.some(opt => opt.value === v)
                        );

                        const uniqueNewOthers = [...new Set(newOthers)];
                        field.onChange([...predefinedOnes, ...uniqueNewOthers]);
                      };

                      return (
                        <FormItem className='space-y-4'>
                          {/* Other Medical Input */}
                          <div className='space-y-2'>
                            <h4 className='text-sm font-medium text-primary'>
                              Bệnh lý khác (nếu có)
                            </h4>
                            <Input
                              className='w-full'
                              placeholder='Nhập bệnh lý khác, cách nhau bởi dấu phẩy'
                              value={otherInput}
                              onChange={handleOtherChange}
                            />
                          </div>

                          {/* Predefined Medical History Options */}
                          <div className='space-y-2'>
                            <h4 className='text-sm font-medium text-primary'>
                              Các bệnh lý phổ biến
                            </h4>
                            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2'>
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
                                        : 'border-border bg-background hover:bg-accent/60 hover:border-primary/30'
                                    )}
                                  >
                                    <div className='relative w-full aspect-square rounded-lg overflow-hidden bg-muted shadow-sm shrink-0 mb-1.5'>
                                      <img
                                        src={option.image}
                                        alt={option.label}
                                        className='w-full h-full object-cover'
                                      />
                                    </div>
                                    <span
                                      className={cn(
                                        'text-xs font-semibold text-center leading-tight w-full px-1',
                                        isSelected
                                          ? 'text-primary'
                                          : 'text-foreground/80'
                                      )}
                                    >
                                      {option.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className='flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4'>
                <Button
                  type='submit'
                  disabled={isUpdating}
                  size='default'
                  className='min-w-[140px]'
                >
                  {isUpdating ? (
                    <>
                      <Spinner className='h-4 w-4 mr-2' />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePhysicalStats;
