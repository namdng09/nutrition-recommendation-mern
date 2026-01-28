import { Plus, Search } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { buildQueryParams } from '~/lib/build-query-params';

const IngredientsFilter = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    values: {
      name: searchParams.get('name') || ''
    }
  });

  const handleSearch = data => {
    const sort = searchParams.get('sort');
    const queryParams = buildQueryParams({ ...data, page: 1, sort });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSearch)} className='space-y-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full sm:w-64'>
                <FormControl>
                  <div className='relative'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Tìm kiếm theo tên...'
                      className='pl-8'
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <Button type='submit' disabled={isPending}>
            <Search className='mr-2 h-4 w-4' />
            {isPending ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
          <Button
            type='button'
            onClick={() =>
              navigate('/nutritionist/manage-ingredients/create-ingredient')
            }
            className='sm:ml-auto'
          >
            <Plus className='mr-2 h-4 w-4' />
            Tạo nguyên liệu
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IngredientsFilter;
