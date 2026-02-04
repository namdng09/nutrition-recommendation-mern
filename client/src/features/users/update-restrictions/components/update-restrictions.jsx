import { yupResolver } from '@hookform/resolvers/yup';
import { Save, Utensils } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { ALLERGEN_GROUPS } from '~/constants/allergen';
import { DIET_OPTIONS } from '~/constants/diet';
import { useUpdateRestrictions } from '~/features/users/update-restrictions/api/update-restrictions';
import { updateRestrictionsSchema } from '~/features/users/update-restrictions/schemas/update-restrictions-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';

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
          diet: profile.diet || '',
          allergens: profile.allergens || []
        }
      : undefined
  });

  const handleSave = data => {
    updateRestrictions(data);
  };

  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-4 flex items-center gap-2'>
        <Utensils className='h-7 w-7' />
        <h1 className='text-2xl font-bold'>Chế độ ăn & Dị ứng</h1>
      </div>

      <div className='rounded-2xl border border-border bg-background p-6 shadow-sm'>
        <div className='mb-6'>
          <h2 className='text-lg font-semibold'>Hạn chế chế độ ăn</h2>
          <p className='text-sm'>
            Đặt chế độ ăn ưa thích và thông tin dị ứng của bạn để nhận đề xuất
            bữa ăn phù hợp
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className='space-y-6'>
            <FormField
              control={form.control}
              name='diet'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại chế độ ăn</FormLabel>
                  <Select
                    key={profile?.id + '-diet-' + (field.value ?? '')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
                        <SelectValue placeholder='Chọn chế độ ăn của bạn' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DIET_OPTIONS.map(option => (
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

            <Controller
              control={form.control}
              name='allergens'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dị ứng thực phẩm</FormLabel>
                  <MultiSelect
                    key={profile?.id + '-allergens'}
                    values={field.value || []}
                    onValuesChange={field.onChange}
                  >
                    <FormControl>
                      <MultiSelectTrigger className='w-full rounded-xl border-border focus:ring-ring'>
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
                            <MultiSelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </MultiSelectItem>
                          ))}
                        </MultiSelectGroup>
                      ))}
                    </MultiSelectContent>
                  </MultiSelect>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Chọn các thực phẩm bạn bị dị ứng hoặc muốn tránh
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end pt-4'>
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
}
