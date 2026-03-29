import { Search, X } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { buildQueryParams } from '~/lib/build-query-params';

const CollectionFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    values: {
      name: searchParams.get('name') || ''
    }
  });

  const handleSearch = data => {
    const sort = searchParams.get('sort');
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value?.trim?.() !== '')
    );

    const queryParams = buildQueryParams({
      ...filteredData,
      page: 1,
      ...(sort ? { sort } : {})
    });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const handleReset = () => {
    form.reset({ name: '' });
    const sort = searchParams.get('sort');
    const queryParams = buildQueryParams({
      page: 1,
      ...(sort ? { sort } : {})
    });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const hasFilter = !!form.watch('name')?.trim();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSearch)} className='space-y-4'>
        <div className='rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full sm:flex-1'>
                  <FormControl>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        placeholder='Tìm kiếm theo tên bộ sưu tập...'
                        className='h-11 pl-9'
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className='flex gap-2'>
              <Button type='submit' className='h-11 px-5' disabled={isPending}>
                <Search className='mr-2 h-4 w-4' />
                {isPending ? 'Đang tìm...' : 'Tìm kiếm'}
              </Button>

              {hasFilter && (
                <Button
                  type='button'
                  variant='outline'
                  className='h-11 px-5'
                  onClick={handleReset}
                  disabled={isPending}
                >
                  <X className='mr-2 h-4 w-4' />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CollectionFilter;
