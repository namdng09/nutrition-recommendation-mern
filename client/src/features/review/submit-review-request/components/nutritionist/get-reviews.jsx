import { Eye, Search, Star, X } from 'lucide-react';
import { useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Badge } from '~/components/ui/badge';
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
import { Skeleton } from '~/components/ui/skeleton';
import {
  REVIEW_STATUS,
  REVIEW_STATUS_OPTIONS
} from '~/constants/review-status';
import { useNutritionistReviews } from '~/features/review/submit-review-request/api/get-reviews';
import { buildQueryParams } from '~/lib/build-query-params';
import { formatDate } from '~/lib/utils';

const ReviewsSkeleton = () => {
  return (
    <div className='rounded-md border p-4 space-y-3'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-1/3' />
    </div>
  );
};

const getStatusClassName = status => {
  if (status === REVIEW_STATUS.PENDING) {
    return 'border-amber-300 bg-amber-50 text-amber-700';
  }

  if (status === REVIEW_STATUS.EVALUATED) {
    return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  }

  return '';
};

const GetReviews = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    values: {
      name: searchParams.get('name') || '',
      status: searchParams.get('evaluation.status') || ''
    }
  });

  const params = {
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
    sort: searchParams.get('sort') || '-createdAt',
    name: searchParams.get('name') || undefined,
    'evaluation.status': searchParams.get('evaluation.status') || undefined
  };

  const {
    data,
    isLoading,
    isError,
    refetch: refetchReviews
  } = useNutritionistReviews(params);

  const handleSearch = values => {
    const sort = searchParams.get('sort');

    const payload = {
      name: values.name,
      'evaluation.status': values.status
    };

    const filteredData = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== '')
    );

    const queryParams = buildQueryParams({
      ...filteredData,
      page: 1,
      sort
    });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const handleReset = () => {
    form.reset({ name: '', status: '' });

    const sort = searchParams.get('sort');
    const queryParams = buildQueryParams({ page: 1, sort });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: 'Hình ảnh',
        cell: ({ row }) => (
          <img
            src={row.original.image || '/logo2.png'}
            alt={row.original.name}
            className='h-10 w-10 object-cover rounded'
          />
        ),
        enableSorting: false
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Tên món ăn' />
        )
      },
      {
        accessorKey: 'user.name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Người gửi' />
        ),
        cell: ({ row }) => row.original.user?.name || '-'
      },
      {
        accessorKey: 'evaluation.status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Trạng thái' />
        ),
        cell: ({ row }) => (
          <Badge
            variant='outline'
            className={getStatusClassName(row.original.evaluation?.status)}
          >
            {row.original.evaluation?.status || '-'}
          </Badge>
        )
      },
      {
        accessorKey: 'evaluation.rating',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Điểm' />
        ),
        cell: ({ row }) => {
          const rating = row.original.evaluation?.rating;

          return rating ? (
            <span className='inline-flex items-center gap-1'>
              <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
              {rating}/5
            </span>
          ) : (
            '-'
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Ngày tạo yêu cầu' />
        ),
        cell: ({ row }) => formatDate(row.original.createdAt)
      },
      {
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => {
          const canEvaluate =
            row.original.evaluation?.status === REVIEW_STATUS.PENDING;

          return (
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  navigate(`/nutritionist/reviews/${row.original._id}`)
                }
                title='Xem chi tiết review'
              >
                <Eye className='h-4 w-4' />
              </Button>

              <Button
                size='sm'
                disabled={!canEvaluate}
                onClick={() =>
                  navigate(
                    `/nutritionist/reviews/${row.original._id}?action=evaluate`
                  )
                }
              >
                Đánh giá
              </Button>
            </div>
          );
        },
        enableSorting: false
      }
    ],
    [navigate]
  );

  const hasFilters = form.watch('name') || form.watch('status');

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className='space-y-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full sm:w-80'>
                  <FormControl>
                    <div className='relative'>
                      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                      <Input
                        placeholder='Tìm theo tên món ăn...'
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
              name='status'
              render={({ field }) => (
                <FormItem className='w-full sm:w-56'>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Trạng thái review' />
                    </SelectTrigger>
                    <SelectContent>
                      {REVIEW_STATUS_OPTIONS.map(option => (
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

      {isLoading ? <ReviewsSkeleton /> : null}

      {isError ? (
        <div className='rounded-md border border-destructive/40 bg-destructive/5 p-4'>
          <p className='text-sm text-destructive'>
            Không thể tải danh sách review. Vui lòng thử lại.
          </p>
          <Button
            variant='outline'
            className='mt-3'
            onClick={() => refetchReviews()}
          >
            Tải lại
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <CommonTable
          columns={columns}
          data={data}
          emptyMessage='Chưa có yêu cầu review món riêng từ người dùng.'
        />
      ) : null}
    </>
  );
};

export default GetReviews;
