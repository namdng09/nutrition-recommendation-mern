import { Search, X } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { FEEDBACK_TYPE_OPTIONS } from '~/constants/feedback-type';
import { buildQueryParams } from '~/lib/build-query-params';

const FeedbackFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    values: {
      content: searchParams.get('content') || '',
      type: searchParams.get('type') || ''
    }
  });

  const handleSearch = data => {
    const sort = searchParams.get('sort');
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '')
    );
    const queryParams = buildQueryParams({ ...filteredData, page: 1, sort });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const handleReset = () => {
    form.reset({ content: '', type: '' });
    const sort = searchParams.get('sort');
    const queryParams = buildQueryParams({ page: 1, sort });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const content = form.watch('content');
  const type = form.watch('type');
  const hasFilters = content || type;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSearch)} className='space-y-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end'>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem className='w-full sm:w-80'>
                <FormControl>
                  <div className='relative'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Tìm theo nội dung feedback...'
                      className='pl-8'
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem className='w-full sm:w-52'>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Loại feedback' />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className='flex gap-2'>
            <Button type='submit' disabled={isPending}>
              <Search className='mr-2 h-4 w-4' />
              {isPending ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>

            {hasFilters && (
              <Button
                type='button'
                variant='outline'
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

export default FeedbackFilter;
