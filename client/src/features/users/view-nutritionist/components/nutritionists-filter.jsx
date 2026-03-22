import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { buildQueryParams } from '~/lib/build-query-params';

const NutritionistsFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    values: {
      name: searchParams.get('name') || ''
    }
  });

  const hasFilter = !!form.watch('name');

  const handleSearch = data => {
    const queryParams = buildQueryParams({ ...data, page: 1 });
    startTransition(() => setSearchParams(queryParams));
  };

  const handleReset = () => {
    form.reset({ name: '' });
    startTransition(() => setSearchParams({}));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSearch)}
        className='flex flex-col gap-3 sm:flex-row sm:items-center'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='flex-1'>
              <FormControl>
                <Input
                  placeholder='Tìm kiếm theo tên chuyên gia...'
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className='flex gap-2'>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
          {hasFilter && (
            <Button type='button' variant='outline' onClick={handleReset}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default NutritionistsFilter;
