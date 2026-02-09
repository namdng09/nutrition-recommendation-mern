import { yupResolver } from '@hookform/resolvers/yup';
import { OctagonAlert } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Form, FormItem, FormMessage } from '~/components/ui/form';
import { Spinner } from '~/components/ui/spinner';
import { ALLERGEN_GROUPS } from '~/constants/allergen';
import { useUpdateAllergens } from '~/features/users/update-allergens/api/update-allergens';
import { updateAllergensSchema } from '~/features/users/update-allergens/schemas/update-allergens-shema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { cn } from '~/lib/utils';

// Color mapping for allergen categories
const ALLERGEN_CATEGORY_COLORS = {
  'Các thực phẩm dễ gây dị ứng phổ biến': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    selectedBg: 'bg-red-100',
    selectedBorder: 'border-red-500',
    selectedText: 'text-red-700',
    hoverBg: 'hover:bg-red-50',
    hoverBorder: 'hover:border-red-300'
  },
  'Các loại ngũ cốc có chứa gluten': {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    selectedBg: 'bg-amber-100',
    selectedBorder: 'border-amber-500',
    selectedText: 'text-amber-700',
    hoverBg: 'hover:bg-amber-50',
    hoverBorder: 'hover:border-amber-300'
  },
  'Các loại hải sản và sản phẩm từ hải sản': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    selectedBg: 'bg-blue-100',
    selectedBorder: 'border-blue-500',
    selectedText: 'text-blue-700',
    hoverBg: 'hover:bg-blue-50',
    hoverBorder: 'hover:border-blue-300'
  },
  'Các loại hạt và hạt có dầu': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    selectedBg: 'bg-orange-100',
    selectedBorder: 'border-orange-500',
    selectedText: 'text-orange-700',
    hoverBg: 'hover:bg-orange-50',
    hoverBorder: 'hover:border-orange-300'
  },
  'Các loại thịt và sản phẩm từ thịt': {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    selectedBg: 'bg-rose-100',
    selectedBorder: 'border-rose-500',
    selectedText: 'text-rose-700',
    hoverBg: 'hover:bg-rose-50',
    hoverBorder: 'hover:border-rose-300'
  },
  'Các loại trái cây': {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    selectedBg: 'bg-pink-100',
    selectedBorder: 'border-pink-500',
    selectedText: 'text-pink-700',
    hoverBg: 'hover:bg-pink-50',
    hoverBorder: 'hover:border-pink-300'
  },
  'Các loại rau củ': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    selectedBg: 'bg-green-100',
    selectedBorder: 'border-green-500',
    selectedText: 'text-green-700',
    hoverBg: 'hover:bg-green-50',
    hoverBorder: 'hover:border-green-300'
  },
  'Các loại gia vị và thảo mộc': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    selectedBg: 'bg-emerald-100',
    selectedBorder: 'border-emerald-500',
    selectedText: 'text-emerald-700',
    hoverBg: 'hover:bg-emerald-50',
    hoverBorder: 'hover:border-emerald-300'
  },
  'Các loại đậu': {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    selectedBg: 'bg-teal-100',
    selectedBorder: 'border-teal-500',
    selectedText: 'text-teal-700',
    hoverBg: 'hover:bg-teal-50',
    hoverBorder: 'hover:border-teal-300'
  },
  'Các loại nấm': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    selectedBg: 'bg-purple-100',
    selectedBorder: 'border-purple-500',
    selectedText: 'text-purple-700',
    hoverBg: 'hover:bg-purple-50',
    hoverBorder: 'hover:border-purple-300'
  },
  Khác: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    selectedBg: 'bg-gray-100',
    selectedBorder: 'border-gray-500',
    selectedText: 'text-gray-700',
    hoverBg: 'hover:bg-gray-50',
    hoverBorder: 'hover:border-gray-300'
  }
};

export function UpdateAllergens() {
  const { data: profile } = useProfileForPage();
  const { mutate: updateAllergens, isPending: isUpdating } = useUpdateAllergens(
    {
      onSuccess: response => {
        toast.success(
          response?.message || 'Cập nhật danh sách kiêng thực phẩm thành công'
        );
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message ||
            'Cập nhật danh sách kiêng thực phẩm thất bại'
        );
      }
    }
  );

  const form = useForm({
    resolver: yupResolver(updateAllergensSchema),
    values: profile
      ? {
          allergens: profile.allergens || []
        }
      : undefined
  });

  const handleSave = data => {
    updateAllergens(data);
  };

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10'>
              <OctagonAlert className='h-5 w-5 text-destructive' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Thực phẩm dị ứng
            </h1>
          </div>
          <p className='text-sm text-muted-foreground sm:text-base'>
            Chọn các loại thực phẩm bạn muốn loại bỏ khỏi thực đơn
          </p>
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
                    <OctagonAlert
                      size={140}
                      strokeWidth={1}
                      className='text-destructive/30'
                    />
                  </div>

                  {/* Right Column - Allergen Groups */}
                  <div className='min-w-0'>
                    <Controller
                      control={form.control}
                      name='allergens'
                      render={({ field }) => {
                        const currentValues = field.value || [];

                        const toggleAllergen = allergenValue => {
                          if (currentValues.includes(allergenValue)) {
                            field.onChange(
                              currentValues.filter(v => v !== allergenValue)
                            );
                          } else {
                            field.onChange([...currentValues, allergenValue]);
                          }
                        };

                        return (
                          <FormItem className='space-y-6'>
                            {ALLERGEN_GROUPS.map(group => {
                              const colors =
                                ALLERGEN_CATEGORY_COLORS[group.category] ||
                                ALLERGEN_CATEGORY_COLORS['Khác'];

                              return (
                                <div key={group.category} className='space-y-3'>
                                  {/* Category Header */}
                                  <div className='flex items-center gap-2'>
                                    <div className='h-1 w-8 rounded-full bg-gradient-to-r from-primary to-primary/50' />
                                    <h4 className='text-sm font-semibold text-foreground'>
                                      {group.category}
                                    </h4>
                                  </div>

                                  {/* Allergen Buttons */}
                                  <div className='flex flex-wrap gap-2'>
                                    {group.options.map(option => {
                                      const isSelected = currentValues.includes(
                                        option.value
                                      );

                                      return (
                                        <button
                                          key={option.value}
                                          type='button'
                                          onClick={() =>
                                            toggleAllergen(option.value)
                                          }
                                          className={cn(
                                            'relative inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2',
                                            isSelected
                                              ? `${colors.selectedBg} ${colors.selectedBorder} ${colors.selectedText} shadow-sm scale-[1.02]`
                                              : `bg-background border-border text-foreground ${colors.hoverBg} ${colors.hoverBorder}`
                                          )}
                                        >
                                          {option.label}
                                          {isSelected && (
                                            <span className='ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-current text-white text-xs'>
                                              ✓
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Selected Count */}
                    <div className='mt-6 p-4 rounded-lg bg-muted/50 border border-border'>
                      <p className='text-sm text-muted-foreground'>
                        Đã chọn{' '}
                        <span className='font-semibold text-foreground'>
                          {form.watch('allergens')?.length || 0}
                        </span>{' '}
                        loại thực phẩm để kiêng
                      </p>
                    </div>
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
