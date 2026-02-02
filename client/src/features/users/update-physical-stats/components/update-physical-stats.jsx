import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { Activity, Calendar as CalendarIcon, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { Spinner } from '~/components/ui/spinner';
import { ACTIVITY_LEVEL_OPTIONS } from '~/constants/activity-level';
import { BODYFAT_OPTIONS } from '~/constants/bodyfat';
import { GENDER_OPTIONS } from '~/constants/gender';
import { useUpdatePhysicalStats } from '~/features/users/update-physical-stats/api/update-physical-stats';
import { updatePhysicalStatsSchema } from '~/features/users/update-physical-stats/schemas/update-physical-stats-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { cn } from '~/lib/utils';

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
          activityLevel: profile.activityLevel || ''
        }
      : undefined
  });

  const handleSave = data => {
    updatePhysicalStats(data);
  };

  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Activity className='h-7 w-7' />
        <h1 className='text-2xl font-bold'>Chỉ số cơ thể</h1>
      </div>
      <p className='text-sm text-muted-foreground mb-6'>
        Cập nhật các chỉ số cơ thể của bạn để tính toán nhu cầu dinh dưỡng chính
        xác hơn
      </p>

      <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giới tính <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      key={profile?.id + '-gender-' + (field.value ?? '')}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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
                control={form.control}
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
                              'w-full rounded-xl border-border pl-3 text-left font-normal',
                              !field.value && 'text-foreground/50'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'dd/MM/yyyy')
                            ) : (
                              <span>Chọn ngày sinh</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          key={profile?.id + '-dob-' + (field.value ?? '')}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                        className='rounded-xl border-border focus-visible:ring-ring'
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                        className='rounded-xl border-border focus-visible:ring-ring'
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bodyfat'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mức độ mỡ cơ thể{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      key={profile?.id + '-bodyfat-' + (field.value ?? '')}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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
                control={form.control}
                name='activityLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mức độ hoạt động{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      key={
                        profile?.id + '-activityLevel-' + (field.value ?? '')
                      }
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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

            <div className='flex justify-end'>
              <Button
                type='submit'
                disabled={isUpdating}
                className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
              >
                {isUpdating ? (
                  <Spinner className='h-4 w-4 mr-1' />
                ) : (
                  <Save className='h-4 w-4 mr-1' />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdatePhysicalStats;
