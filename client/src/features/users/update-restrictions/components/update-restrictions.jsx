import { yupResolver } from '@hookform/resolvers/yup';
import { Sandwich } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { Spinner } from '~/components/ui/spinner';
import { DIET_OPTIONS } from '~/constants/diet';
import { useUpdateRestrictions } from '~/features/users/update-restrictions/api/update-restrictions';
import { updateRestrictionsSchema } from '~/features/users/update-restrictions/schemas/update-restrictions-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { cn } from '~/lib/utils';

// Icon color mapping for each diet type
const DIET_COLORS = {
  'Ăn uống tự do': {
    iconBg: 'bg-orange-100/80',
    iconColor: 'text-orange-600',
    selectedBg: 'bg-orange-50',
    selectedBorder: 'border-orange-500',
    hoverBorder: 'hover:border-orange-300'
  },
  Keto: {
    iconBg: 'bg-amber-100/80',
    iconColor: 'text-amber-700',
    selectedBg: 'bg-amber-50',
    selectedBorder: 'border-amber-500',
    hoverBorder: 'hover:border-amber-300'
  },
  'Địa Trung Hải': {
    iconBg: 'bg-blue-100/80',
    iconColor: 'text-blue-600',
    selectedBg: 'bg-blue-50',
    selectedBorder: 'border-blue-500',
    hoverBorder: 'hover:border-blue-300'
  },
  Paleo: {
    iconBg: 'bg-rose-100/80',
    iconColor: 'text-rose-600',
    selectedBg: 'bg-rose-50',
    selectedBorder: 'border-rose-500',
    hoverBorder: 'hover:border-rose-300'
  },
  'Thuần chay': {
    iconBg: 'bg-emerald-100/80',
    iconColor: 'text-emerald-600',
    selectedBg: 'bg-emerald-50',
    selectedBorder: 'border-emerald-500',
    hoverBorder: 'hover:border-emerald-300'
  },
  'Ăn chay': {
    iconBg: 'bg-green-100/80',
    iconColor: 'text-green-600',
    selectedBg: 'bg-green-50',
    selectedBorder: 'border-green-500',
    hoverBorder: 'hover:border-green-300'
  }
};

export function UpdateRestrictions() {
  const { data: profile } = useProfileForPage();
  const { mutate: updateRestrictions, isPending: isUpdating } =
    useUpdateRestrictions({
      onSuccess: response => {
        toast.success(response?.message || 'Cập nhật chế độ ăn thành công');
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Cập nhật chế độ ăn thất bại'
        );
      }
    });

  const form = useForm({
    resolver: yupResolver(updateRestrictionsSchema),
    values: profile
      ? {
          diet: profile.diet || ''
        }
      : undefined
  });

  const handleSave = data => {
    updateRestrictions(data);
  };

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Sandwich className='h-5 w-5 text-primary' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Chế độ ăn
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
              {/* Form Content */}
              <div className='p-6'>
                <div className='grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8'>
                  {/* Left Column - Avatar & Icon */}

                  {/* Icon */}
                  <div className='relative flex items-center justify-center'>
                    <Sandwich
                      size={140}
                      strokeWidth={1}
                      className='text-primary/30'
                    />
                  </div>

                  {/* Right Column - Diet Options */}
                  <div className='min-w-0'>
                    <FormField
                      control={form.control}
                      name='diet'
                      render={({ field }) => (
                        <FormItem className='space-y-0'>
                          <div className='flex flex-col gap-3'>
                            {DIET_OPTIONS.map(option => {
                              const isSelected = field.value === option.value;
                              const Icon = option.icon;
                              const colors = DIET_COLORS[option.label] || {
                                iconBg: 'bg-gray-100/80',
                                iconColor: 'text-gray-600',
                                selectedBg: 'bg-gray-50',
                                selectedBorder: 'border-gray-500',
                                hoverBorder: 'hover:border-gray-300'
                              };

                              return (
                                <div
                                  key={option.value}
                                  className={cn(
                                    'relative group flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
                                    isSelected
                                      ? `${colors.selectedBorder} ${colors.selectedBg} shadow-md scale-[1.02]`
                                      : `border-border bg-background ${colors.hoverBorder} hover:bg-accent/30 hover:shadow-sm`
                                  )}
                                  onClick={() => field.onChange(option.value)}
                                >
                                  {/* Radio Button */}
                                  <div
                                    className={cn(
                                      'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                                      isSelected
                                        ? `${colors.selectedBorder.replace('border-', 'border-')} bg-white`
                                        : 'border-muted-foreground group-hover:border-muted-foreground/70'
                                    )}
                                  >
                                    {isSelected && (
                                      <div
                                        className={cn(
                                          'h-2.5 w-2.5 rounded-full shadow-sm animate-in zoom-in-50 duration-200',
                                          colors.selectedBorder.replace(
                                            'border-',
                                            'bg-'
                                          )
                                        )}
                                      />
                                    )}
                                  </div>

                                  {/* Icon */}
                                  <div
                                    className={cn(
                                      'flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 flex-shrink-0',
                                      colors.iconBg
                                    )}
                                  >
                                    <Icon
                                      className={cn(
                                        'size-7 transition-colors duration-200',
                                        colors.iconColor
                                      )}
                                      strokeWidth={1.5}
                                    />
                                  </div>

                                  {/* Content */}
                                  <div className='min-w-0 flex-1'>
                                    <h4
                                      className={cn(
                                        'font-semibold text-base leading-tight mb-1 transition-colors duration-200',
                                        isSelected
                                          ? colors.iconColor
                                          : 'text-foreground'
                                      )}
                                    >
                                      {option.label}
                                    </h4>
                                    <p className='text-sm text-muted-foreground line-clamp-2'>
                                      {option.description}
                                    </p>
                                  </div>

                                  {/* Selected Indicator */}
                                  {isSelected && (
                                    <div
                                      className={cn(
                                        'absolute top-2 right-2 w-2 h-2 rounded-full animate-in zoom-in-50 duration-200',
                                        colors.selectedBorder.replace(
                                          'border-',
                                          'bg-'
                                        )
                                      )}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage className='mt-3' />
                        </FormItem>
                      )}
                    />
                  </div>
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
}
