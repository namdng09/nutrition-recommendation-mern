import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Crown,
  RefreshCw,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as RechartsPrimitive from 'recharts';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import {
  ADMIN_DASHBOARD_RANGE_VALUES,
  useAdminDashboard
} from '~/features/dashboard/api/dashboard';

import DashboardSkeleton from './dashboard-skeleton';

const RANGE_OPTIONS = {
  today: 'Hôm nay',
  yesterday: 'Hôm qua',
  last7days: '7 ngày gần đây',
  last30days: '30 ngày gần đây',
  thisMonth: 'Tháng này',
  lastMonth: 'Tháng trước',
  thisYear: 'Năm nay',
  allTime: 'Toàn thời gian',
  custom: 'Tuỳ chọn'
};

const DEFAULT_RANGE = 'allTime';

const getStatusBadgeClassName = status => {
  if (status.toLowerCase().includes('hoàn thành')) {
    return 'text-green-light';
  }

  if (status.toLowerCase().includes('chờ')) {
    return 'text-orange-light';
  }

  if (
    status.toLowerCase().includes('huỷ') ||
    status.toLowerCase().includes('hủy')
  ) {
    return 'text-purple-light';
  }

  return 'text-blue-light';
};

const formatCurrencyVND = value => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
};

const formatNumber = value => Number(value ?? 0).toLocaleString('vi-VN');

const getRangeLabel = period =>
  RANGE_OPTIONS[period] || period || RANGE_OPTIONS[DEFAULT_RANGE];

const getCardTone = tone => {
  if (tone === 'success') {
    return {
      wrapper:
        'bg-gradient-to-br from-emerald-50 to-green-100/60 border-emerald-200 dark:from-emerald-950/30 dark:to-green-950/20 dark:border-emerald-900/60',
      icon: 'bg-emerald-500/90 text-white',
      value: 'text-emerald-700 dark:text-emerald-300'
    };
  }

  if (tone === 'warning') {
    return {
      wrapper:
        'bg-gradient-to-br from-amber-50 to-orange-100/60 border-amber-200 dark:from-amber-950/30 dark:to-orange-950/20 dark:border-amber-900/60',
      icon: 'bg-amber-500/90 text-white',
      value: 'text-amber-700 dark:text-amber-300'
    };
  }

  if (tone === 'vip') {
    return {
      wrapper:
        'bg-gradient-to-br from-violet-50 to-fuchsia-100/60 border-violet-200 dark:from-violet-950/30 dark:to-fuchsia-950/20 dark:border-violet-900/60',
      icon: 'bg-violet-500/90 text-white',
      value: 'text-violet-700 dark:text-violet-300'
    };
  }

  return {
    wrapper:
      'bg-gradient-to-br from-cyan-50 to-blue-100/60 border-cyan-200 dark:from-cyan-950/30 dark:to-blue-950/20 dark:border-cyan-900/60',
    icon: 'bg-cyan-500/90 text-white',
    value: 'text-cyan-700 dark:text-cyan-300'
  };
};

const Dashboard = () => {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lastValidData, setLastValidData] = useState(null);

  const queryParams = useMemo(() => {
    if (range === 'custom') {
      return {
        range,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };
    }

    return { range };
  }, [range, startDate, endDate]);

  const isQueryEnabled =
    range !== 'custom' || (Boolean(startDate) && Boolean(endDate));

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAdminDashboard(queryParams, { enabled: isQueryEnabled });

  useEffect(() => {
    if (data) {
      setLastValidData(data);
    }
  }, [data]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <Card className='border-destructive/30'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <AlertCircle className='size-5' />
            Không thể tải dashboard
          </CardTitle>
          <CardDescription>
            {error?.response?.data?.message ||
              'Đã xảy ra lỗi khi lấy dữ liệu từ máy chủ.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} variant='outline'>
            <RefreshCw className='size-4 mr-2' />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isQueryEnabled && !lastValidData) {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Dashboard quản trị
            </h1>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className='w-full sm:w-44'>
                <SelectValue placeholder='Khoảng thời gian' />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_DASHBOARD_RANGE_VALUES.map(option => (
                  <SelectItem key={option} value={option}>
                    {RANGE_OPTIONS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type='date'
              value={startDate}
              onChange={event => setStartDate(event.target.value)}
              className='w-full sm:w-[150px]'
            />
            <Input
              type='date'
              value={endDate}
              onChange={event => setEndDate(event.target.value)}
              className='w-full sm:w-[150px]'
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chưa đủ điều kiện tải dữ liệu</CardTitle>
            <CardDescription>
              Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc để xem dữ liệu
              theo khoảng tuỳ chọn.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const dashboardData = data || lastValidData;
  const overview = dashboardData?.overview || {};
  const statusBreakdown = dashboardData?.statusBreakdown || [];
  const showCustomRangeHint = range === 'custom' && !isQueryEnabled;
  const maxRevenue = Math.max(
    ...statusBreakdown.map(item => item.revenue || 0),
    1
  );
  const maxCount = Math.max(...statusBreakdown.map(item => item.count || 0), 1);

  const chartData = statusBreakdown.map(item => ({
    status: item.status,
    revenue: Number(item.revenue || 0),
    count: Number(item.count || 0)
  }));

  const chartConfig = {
    revenue: {
      label: 'Doanh thu',
      color: 'var(--chart-1)'
    },
    count: {
      label: 'Số lượng',
      color: 'var(--chart-2)'
    }
  };

  const metricCards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrencyVND(overview.totalRevenue),
      description: 'Doanh thu từ các giao dịch nâng cấp',
      icon: Wallet,
      tone: 'info'
    },
    {
      title: 'Tổng lượt nâng cấp',
      value: formatNumber(overview.totalUpgrades),
      description: 'Tổng giao dịch yêu cầu nâng VIP',
      icon: TrendingUp,
      tone: 'warning'
    },
    {
      title: 'Nâng cấp hoàn thành',
      value: formatNumber(overview.totalCompletedUpgrades),
      description: 'Số giao dịch thanh toán thành công',
      icon: CheckCircle2,
      tone: 'success'
    },
    {
      title: 'Tổng tài khoản VIP',
      value: formatNumber(overview.totalVipUsers),
      description: 'Người dùng đang có gói VIP',
      icon: Crown,
      tone: 'vip'
    }
  ];

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map(item => {
          const tone = getCardTone(item.tone);
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className={`border transition-transform duration-200 hover:-translate-y-0.5 ${tone.wrapper}`}
            >
              <CardContent className='pt-6'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-foreground/80'>
                      {item.title}
                    </p>
                    <p className={`text-2xl font-semibold ${tone.value}`}>
                      {item.value}
                    </p>
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${tone.icon}`}
                  >
                    <Icon className='size-5' />
                  </div>
                </div>
                <p className='mt-3 text-xs text-muted-foreground'>
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <span className='text-sm text-muted-foreground'>Kỳ đang xem:</span>
        <Badge variant='secondary'>
          {getRangeLabel(dashboardData?.period)}
        </Badge>
        <Badge variant='outline'>
          {formatNumber(statusBreakdown.length)} trạng thái thanh toán
        </Badge>
      </div>

      <Card className='relative overflow-hidden via-background'>
        <div className='pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-2xl' />
        <div className='pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-cyan-500/15 blur-2xl' />
        <CardContent className='relative pt-6'>
          <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
            <div className='space-y-2'>
              <div className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium'>
                <CalendarDays className='size-3.5 text-primary' />
                Báo cáo: {getRangeLabel(dashboardData?.period)}
              </div>

              {showCustomRangeHint && (
                <p className='text-xs text-muted-foreground'>
                  Đang hiển thị dữ liệu gần nhất. Chọn đủ ngày bắt đầu và kết
                  thúc để tải dữ liệu tuỳ chọn.
                </p>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className='w-full sm:w-44'>
                  <SelectValue placeholder='Khoảng thời gian' />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_DASHBOARD_RANGE_VALUES.map(option => (
                    <SelectItem key={option} value={option}>
                      {RANGE_OPTIONS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {range === 'custom' && (
                <>
                  <Input
                    type='date'
                    value={startDate}
                    onChange={event => setStartDate(event.target.value)}
                    className='w-full sm:w-[150px]'
                  />
                  <Input
                    type='date'
                    value={endDate}
                    onChange={event => setEndDate(event.target.value)}
                    className='w-full sm:w-[150px]'
                  />
                </>
              )}

              <Button
                variant='outline'
                onClick={() => refetch()}
                disabled={isFetching}
                className='bg-background/80'
              >
                <RefreshCw
                  className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
                />
                Làm mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết theo trạng thái thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          {statusBreakdown.length > 0 ? (
            <div className='mb-6'>
              <ChartContainer
                config={chartConfig}
                className='h-[320px] w-full aspect-auto'
              >
                <RechartsPrimitive.AreaChart
                  data={chartData}
                  margin={{ left: 8, right: 8, top: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id='fillRevenue'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor='var(--color-revenue)'
                        stopOpacity={0.35}
                      />
                      <stop
                        offset='95%'
                        stopColor='var(--color-revenue)'
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient id='fillCount' x1='0' y1='0' x2='0' y2='1'>
                      <stop
                        offset='5%'
                        stopColor='var(--color-count)'
                        stopOpacity={0.25}
                      />
                      <stop
                        offset='95%'
                        stopColor='var(--color-count)'
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>

                  <RechartsPrimitive.CartesianGrid vertical={false} />
                  <RechartsPrimitive.XAxis
                    dataKey='status'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <RechartsPrimitive.YAxis
                    yAxisId='left'
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => formatNumber(value)}
                  />
                  <RechartsPrimitive.YAxis
                    yAxisId='right'
                    orientation='right'
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => formatNumber(value)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator='line'
                        formatter={(value, name) => (
                          <div className='flex w-full items-center justify-between gap-2'>
                            <span className='text-muted-foreground'>
                              {name === 'revenue' ? 'Doanh thu' : 'Số lượng'}
                            </span>
                            <span className='font-medium text-foreground'>
                              {name === 'revenue'
                                ? formatCurrencyVND(value)
                                : formatNumber(value)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />

                  <RechartsPrimitive.Area
                    yAxisId='left'
                    type='monotone'
                    dataKey='revenue'
                    stroke='var(--color-revenue)'
                    fill='url(#fillRevenue)'
                    strokeWidth={2.2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <RechartsPrimitive.Area
                    yAxisId='right'
                    type='monotone'
                    dataKey='count'
                    stroke='var(--color-count)'
                    fill='url(#fillCount)'
                    strokeWidth={2}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4.5 }}
                  />
                </RechartsPrimitive.AreaChart>
              </ChartContainer>
            </div>
          ) : null}

          <Table className='rounded-lg overflow-hidden'>
            <TableHeader>
              <TableRow>
                <TableHead>Trạng thái</TableHead>
                <TableHead className='text-right'>Số lượng giao dịch</TableHead>
                <TableHead className='text-right'>Doanh thu</TableHead>
                <TableHead className='w-[220px]'>Tỷ trọng doanh thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusBreakdown.map(item => (
                <TableRow key={item.status}>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={`font-medium ${getStatusBadgeClassName(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='inline-flex items-center gap-2'>
                      <span>{formatNumber(item.count)}</span>
                      <span className='text-xs'>
                        (
                        {Math.round((Number(item.count || 0) / maxCount) * 100)}
                        %)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrencyVND(item.revenue)}
                  </TableCell>
                  <TableCell>
                    <div className='h-2.5 w-full rounded-full bg-muted'>
                      <div
                        className='h-2.5 rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all'
                        style={{
                          width: `${Math.max(
                            6,
                            Math.round(
                              (Number(item.revenue || 0) / maxRevenue) * 100
                            )
                          )}%`
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {statusBreakdown.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className='h-20 text-center'>
                    Không có dữ liệu cho khoảng thời gian đã chọn.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
