import { yupResolver } from '@hookform/resolvers/yup';
import { Sandwich } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { Spinner } from '~/components/ui/spinner';
import { DIET, DIET_OPTIONS } from '~/constants/diet';
import { useUpdateRestrictions } from '~/features/users/update-restrictions/api/update-restrictions';
import { updateRestrictionsSchema } from '~/features/users/update-restrictions/schemas/update-restrictions-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { cn } from '~/lib/utils';

const DEFAULT_DIET_COLOR_INDEX = {
  selectedCard: 'text-cyan-light',
  selectedIcon:
    'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300',
  selectedRadio: 'border-cyan-600 dark:border-cyan-400',
  selectedDot: 'bg-cyan-600 dark:bg-cyan-400',
  selectedTitle: 'text-cyan-700 dark:text-cyan-300',
  hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-900/50'
};

const DIET_COLOR_INDEX = {
  [DIET.ANYTHING]: {
    selectedCard: 'text-orange-light',
    selectedIcon:
      'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300',
    selectedRadio: 'border-orange-600 dark:border-orange-400',
    selectedDot: 'bg-orange-600 dark:bg-orange-400',
    selectedTitle: 'text-orange-700 dark:text-orange-300',
    hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-900/50'
  },
  [DIET.KETO]: {
    selectedCard: 'text-purple-light',
    selectedIcon:
      'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300',
    selectedRadio: 'border-purple-600 dark:border-purple-400',
    selectedDot: 'bg-purple-600 dark:bg-purple-400',
    selectedTitle: 'text-purple-700 dark:text-purple-300',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-900/50'
  },
  [DIET.MEDITERRANEAN]: {
    selectedCard: 'text-cyan-light',
    selectedIcon:
      'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300',
    selectedRadio: 'border-cyan-600 dark:border-cyan-400',
    selectedDot: 'bg-cyan-600 dark:bg-cyan-400',
    selectedTitle: 'text-cyan-700 dark:text-cyan-300',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-900/50'
  },
  [DIET.PALEO]: {
    selectedCard: 'text-red-light',
    selectedIcon:
      'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300',
    selectedRadio: 'border-red-600 dark:border-red-400',
    selectedDot: 'bg-red-600 dark:bg-red-400',
    selectedTitle: 'text-red-700 dark:text-red-300',
    hoverBorder: 'hover:border-red-300 dark:hover:border-red-900/50'
  },
  [DIET.VEGAN]: {
    selectedCard: 'text-green-light',
    selectedIcon:
      'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300',
    selectedRadio: 'border-green-600 dark:border-green-400',
    selectedDot: 'bg-green-600 dark:bg-green-400',
    selectedTitle: 'text-green-700 dark:text-green-300',
    hoverBorder: 'hover:border-green-300 dark:hover:border-green-900/50'
  },
  [DIET.VEGETARIAN]: {
    selectedCard: 'text-blue-light',
    selectedIcon:
      'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    selectedRadio: 'border-blue-600 dark:border-blue-400',
    selectedDot: 'bg-blue-600 dark:bg-blue-400',
    selectedTitle: 'text-blue-700 dark:text-blue-300',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-900/50'
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
                              const colorIndex =
                                DIET_COLOR_INDEX[option.value] ||
                                DEFAULT_DIET_COLOR_INDEX;

                              return (
                                <div
                                  key={option.value}
                                  className={cn(
                                    'relative group flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
                                    isSelected
                                      ? `${colorIndex.selectedCard} shadow-md scale-[1.02]`
                                      : `border-border bg-background text-foreground ${colorIndex.hoverBorder} hover:bg-accent/30 hover:shadow-sm`
                                  )}
                                  onClick={() => field.onChange(option.value)}
                                >
                                  {/* Radio Button */}
                                  <div
                                    className={cn(
                                      'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                                      isSelected
                                        ? `bg-background ${colorIndex.selectedRadio}`
                                        : 'border-muted-foreground group-hover:border-muted-foreground/70'
                                    )}
                                  >
                                    {isSelected && (
                                      <div
                                        className={cn(
                                          'h-2.5 w-2.5 rounded-full shadow-sm animate-in zoom-in-50 duration-200',
                                          colorIndex.selectedDot
                                        )}
                                      />
                                    )}
                                  </div>

                                  {/* Icon */}
                                  <div
                                    className={cn(
                                      'flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 flex-shrink-0',
                                      isSelected
                                        ? colorIndex.selectedIcon
                                        : 'bg-muted text-muted-foreground group-hover:text-foreground'
                                    )}
                                  >
                                    <Icon
                                      className='size-7 transition-colors duration-200'
                                      strokeWidth={1.5}
                                    />
                                  </div>

                                  {/* Content */}
                                  <div className='min-w-0 flex-1'>
                                    <h4
                                      className={cn(
                                        'font-semibold text-base leading-tight mb-1 transition-colors duration-200',
                                        isSelected
                                          ? colorIndex.selectedTitle
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
                                        colorIndex.selectedDot
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
