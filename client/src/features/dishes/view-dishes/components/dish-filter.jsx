import { Search, X } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { buildQueryParams } from '~/lib/build-query-params';

const DishFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    values: {
      name: searchParams.get('name') || '',
      ingredient: searchParams.get('ingredient') || ''
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
    form.reset({ name: '', ingredient: '' });

    const sort = searchParams.get('sort');
    const queryParams = buildQueryParams({
      page: 1,
      ...(sort ? { sort } : {})
    });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const hasFilters =
    !!form.watch('name')?.trim() || !!form.watch('ingredient')?.trim();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSearch)} className='space-y-4'>
        <div className='rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        placeholder='Tìm theo tên món ăn...'
                        className='h-11 pl-9'
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ingredient'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        placeholder='Tìm theo nguyên liệu...'
                        className='h-11 pl-9'
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className='mt-3 flex flex-wrap gap-2'>
            <Button type='submit' className='h-10 px-5' disabled={isPending}>
              <Search className='mr-2 h-4 w-4' />
              {isPending ? 'Đang lọc...' : 'Lọc món ăn'}
            </Button>

            {hasFilters && (
              <Button
                type='button'
                variant='outline'
                className='h-10 px-5'
                onClick={handleReset}
                disabled={isPending}
              >
                <X className='mr-2 h-4 w-4' />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default DishFilter;
