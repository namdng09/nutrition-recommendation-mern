import { Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { buildQueryParams } from '~/lib/build-query-params';

import { usePayments, useUpdatePaymentStatus } from '../api/view-payments';

const PAYMENT_STATUS = {
  PENDING: 'Đang chờ xử lý',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã huỷ'
};

const MEMBERSHIP_LEVEL = {
  NORMAL: 'Tài khoản thường',
  VIP: 'Tài khoản VIP'
};

const PAYMENT_STATUS_OPTIONS = Object.values(PAYMENT_STATUS);
const MEMBERSHIP_OPTIONS = Object.values(MEMBERSHIP_LEVEL);

const formatMoney = amount =>
  Number(amount ?? 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });

const formatDateTime = value => {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
};

const getStatusBadgeClass = status => {
  if (status === PAYMENT_STATUS.COMPLETED) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  if (status === PAYMENT_STATUS.CANCELLED) {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }

  return 'bg-amber-100 text-amber-700 border-amber-200';
};

const StatusUpdateDialog = ({
  open,
  onOpenChange,
  payment,
  nextStatus,
  onNextStatusChange,
  cancellationReason,
  onCancellationReasonChange,
  isPending,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
          <DialogDescription>
            Đơn hàng #{payment?.orderCode} hiện tại đang ở trạng thái "
            {payment?.status}".
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <p className='text-sm font-medium'>Trạng thái mới</p>
            <Select value={nextStatus} onValueChange={onNextStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PAYMENT_STATUS.COMPLETED}>
                  {PAYMENT_STATUS.COMPLETED}
                </SelectItem>
                <SelectItem value={PAYMENT_STATUS.CANCELLED}>
                  {PAYMENT_STATUS.CANCELLED}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {nextStatus === PAYMENT_STATUS.CANCELLED && (
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Lý do huỷ</p>
              <Textarea
                value={cancellationReason}
                onChange={event =>
                  onCancellationReasonChange(event.target.value)
                }
                placeholder='Nhập lý do huỷ thanh toán...'
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang cập nhật...
              </>
            ) : (
              'Xác nhận'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ViewPayments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPendingTransition, startTransition] = useTransition();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState(PAYMENT_STATUS.COMPLETED);
  const [cancellationReason, setCancellationReason] = useState('');

  const form = useForm({
    values: {
      orderCode: searchParams.get('orderCode') || '',
      status: searchParams.get('status') || '',
      targetMembership: searchParams.get('targetMembership') || ''
    }
  });

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt',
    orderCode: searchParams.get('orderCode') || undefined,
    status: searchParams.get('status') || undefined,
    targetMembership: searchParams.get('targetMembership') || undefined
  };

  const { data } = usePayments(params);

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdatePaymentStatus({
      onSuccess: response => {
        toast.success(response?.message || 'Cập nhật trạng thái thành công');
        setStatusDialogOpen(false);
        setSelectedPayment(null);
        setCancellationReason('');
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Cập nhật trạng thái thất bại'
        );
      }
    });

  const handleSearch = values => {
    const sort = searchParams.get('sort');
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value !== '')
    );

    const query = buildQueryParams({
      ...filteredValues,
      page: 1,
      sort
    });

    startTransition(() => {
      setSearchParams(query);
    });
  };

  const handleReset = () => {
    form.reset({
      orderCode: '',
      status: '',
      targetMembership: ''
    });

    const sort = searchParams.get('sort');
    const query = buildQueryParams({ page: 1, sort });

    startTransition(() => {
      setSearchParams(query);
    });
  };

  const handleOpenStatusDialog = payment => {
    setSelectedPayment(payment);
    setNextStatus(PAYMENT_STATUS.COMPLETED);
    setCancellationReason('');
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusUpdate = () => {
    if (!selectedPayment?.orderCode) return;

    if (nextStatus === PAYMENT_STATUS.CANCELLED && !cancellationReason.trim()) {
      toast.error('Vui lòng nhập lý do huỷ');
      return;
    }

    updateStatus({
      orderCode: selectedPayment.orderCode,
      status: nextStatus,
      cancellationReason:
        nextStatus === PAYMENT_STATUS.CANCELLED
          ? cancellationReason.trim()
          : undefined
    });
  };

  const hasFilters =
    form.watch('orderCode') ||
    form.watch('status') ||
    form.watch('targetMembership');

  const columns = [
    {
      accessorKey: 'orderCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mã đơn hàng' />
      )
    },
    {
      accessorKey: 'user',
      header: 'Người dùng',
      cell: ({ row }) => {
        const user = row.original.user;

        if (!user) return <span>-</span>;

        return (
          <div className='flex flex-col'>
            <span className='font-medium'>{user.name || '-'}</span>
            <span className='text-xs text-muted-foreground'>
              {user.email || '-'}
            </span>
          </div>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'targetMembership',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Gói thành viên' />
      ),
      cell: ({ row }) => row.original.targetMembership || '-'
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Số tiền' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{formatMoney(row.original.amount)}</span>
      )
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Trạng thái' />
      ),
      cell: ({ row }) => (
        <Badge
          variant='outline'
          className={getStatusBadgeClass(row.original.status)}
        >
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày tạo' />
      ),
      cell: ({ row }) => formatDateTime(row.original.createdAt)
    },
    {
      accessorKey: 'completedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày hoàn tất' />
      ),
      cell: ({ row }) => formatDateTime(row.original.completedAt)
    },
    {
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => {
        const isPendingPayment = row.original.status === PAYMENT_STATUS.PENDING;

        return (
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={!isPendingPayment}
              onClick={() => handleOpenStatusDialog(row.original)}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Cập nhật
            </Button>
            {row.original.cancellationReason && (
              <Button
                variant='ghost'
                size='icon'
                title={row.original.cancellationReason}
              >
                <XCircle className='h-4 w-4 text-rose-500' />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false
    }
  ];

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSearch)}
          className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end'
        >
          <FormField
            control={form.control}
            name='orderCode'
            render={({ field }) => (
              <FormItem className='w-full sm:w-56'>
                <FormControl>
                  <Input placeholder='Mã đơn hàng' {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem className='w-full sm:w-56'>
                <Select
                  value={field.value || '__all_status__'}
                  onValueChange={value =>
                    field.onChange(value === '__all_status__' ? '' : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Trạng thái' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='__all_status__'>
                      Tất cả trạng thái
                    </SelectItem>
                    {PAYMENT_STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* <FormField
						control={form.control}
						name='targetMembership'
						render={({ field }) => (
							<FormItem className='w-full sm:w-56'>
								<Select
									value={field.value || '__all_membership__'}
									onValueChange={value =>
										field.onChange(value === '__all_membership__' ? '' : value)
									}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder='Gói thành viên' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value='__all_membership__'>
											Tất cả gói thành viên
										</SelectItem>
										{MEMBERSHIP_OPTIONS.map(membership => (
											<SelectItem key={membership} value={membership}>
												{membership}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/> */}

          <Button type='submit' disabled={isPendingTransition}>
            <Search className='mr-2 h-4 w-4' />
            {isPendingTransition ? 'Đang lọc...' : 'Lọc'}
          </Button>

          {hasFilters && (
            <Button
              type='button'
              variant='outline'
              onClick={handleReset}
              disabled={isPendingTransition}
            >
              Xóa bộ lọc
            </Button>
          )}
        </form>
      </Form>

      <CommonTable
        columns={columns}
        data={data}
        emptyMessage='Không tìm thấy thanh toán nào.'
      />

      <StatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        payment={selectedPayment}
        nextStatus={nextStatus}
        onNextStatusChange={setNextStatus}
        cancellationReason={cancellationReason}
        onCancellationReasonChange={setCancellationReason}
        isPending={isUpdatingStatus}
        onConfirm={handleConfirmStatusUpdate}
      />
    </div>
  );
};

export default ViewPayments;
