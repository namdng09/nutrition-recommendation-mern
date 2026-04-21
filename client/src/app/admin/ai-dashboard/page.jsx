import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import {
  useAIMetricsSummary,
  useAIMetricsTrends
} from '~/features/ai-evaluation/api/ai-evaluation';

const VN_TZ = 'Asia/Ho_Chi_Minh';

const RANGE_OPTIONS = [
  { value: '1', label: '1 ngày' },
  { value: '7', label: '7 ngày' },
  { value: '30', label: '30 ngày' }
];

const SOURCE_OPTIONS = [
  { value: 'both', label: 'Tất cả' },
  { value: 'production', label: 'Production' },
  { value: 'evaluation', label: 'Evaluation' }
];

const toVNDateString = date => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date); // returns YYYY-MM-DD in VN timezone
};

const getDatesByRange = days => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - Number(days) + 1);

  return {
    startDate: toVNDateString(start),
    endDate: toVNDateString(now)
  };
};

const formatPeriodLabel = (period, granularity) => {
  if (!period || typeof period !== 'string') return '';

  try {
    // Handle format: "2026-04-21" or "2026-04-21 17:00" from backend (which is now in VN time)
    let normalized = period;
    if (period.includes(' ')) {
      // Already has time, append +07:00 to specify VN timezone
      normalized = period.replace(' ', 'T') + ':00+07:00';
    } else {
      // Date only, treat as VN midnight
      normalized = period + 'T00:00:00+07:00';
    }

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return period; // Return original if parsing fails
    }

    if (granularity === 'hour') {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: VN_TZ,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date); // e.g. "17:00"
    }

    return new Intl.DateTimeFormat('en-GB', {
      timeZone: VN_TZ,
      day: '2-digit',
      month: '2-digit'
    }).format(date); // e.g. "21/04"
  } catch {
    return period || '';
  }
};

const formatCurrency = value => `$${Number(value || 0).toFixed(4)}`;

const transformTrendsData = data => {
  if (!data || !Array.isArray(data)) return [];

  const grouped = {};
  data.forEach(item => {
    if (!item.period) return;

    if (!grouped[item.period]) {
      grouped[item.period] = {
        period: item.period,
        production: null,
        evaluation: null
      };
    }
    if (item.sourceType === 'production') {
      grouped[item.period].production = item.avgAccuracy;
    } else if (item.sourceType === 'evaluation') {
      grouped[item.period].evaluation = item.avgAccuracy;
    }
  });
  return Object.values(grouped).sort((a, b) =>
    a.period.localeCompare(b.period)
  );
};

const Page = () => {
  const [range, setRange] = useState('1');
  const [source, setSource] = useState('both');

  const granularity = range === '1' ? 'hour' : 'day';

  const dateParams = useMemo(() => getDatesByRange(range), [range]);
  const params = useMemo(
    () => ({
      ...dateParams,
      source,
      granularity
    }),
    [dateParams, source, granularity]
  );

  const summaryQuery = useAIMetricsSummary(params);
  const trendsQuery = useAIMetricsTrends(params);

  const chartData = useMemo(
    () => transformTrendsData(trendsQuery.data),
    [trendsQuery.data]
  );

  const isLoading = summaryQuery.isLoading || trendsQuery.isLoading;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>Dashboard AI</h1>
          <p className='text-sm text-muted-foreground'>
            Theo dõi chất lượng AI từ production và evaluation.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Nguồn dữ liệu' />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Khoảng thời gian' />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            onClick={() => {
              summaryQuery.refetch();
              trendsQuery.refetch();
            }}
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3 xl:grid-cols-5'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {isLoading
                ? '--'
                : `${summaryQuery.data?.accuracy?.avgScore ?? 0}%`}
            </p>
            <p className='text-xs text-muted-foreground'>
              True rate: {summaryQuery.data?.accuracy?.trueRate ?? 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {isLoading ? '--' : `${summaryQuery.data?.latency?.avgMs ?? 0}ms`}
            </p>
            <p className='text-xs text-muted-foreground'>
              Trung bình thời gian phản hồi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {isLoading
                ? '--'
                : formatCurrency(summaryQuery.data?.cost?.totalUsd)}
            </p>
            <p className='text-xs text-muted-foreground'>
              Avg/request: {formatCurrency(summaryQuery.data?.cost?.avgUsd)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Stability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {isLoading
                ? '--'
                : `${summaryQuery.data?.stability?.successRate ?? 0}%`}
            </p>
            <p className='text-xs text-muted-foreground'>
              Tỉ lệ request thành công
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {isLoading
                ? '--'
                : (summaryQuery.data?.security?.piiDetected ?? 0) +
                  (summaryQuery.data?.security?.injectionDetected ?? 0)}
            </p>
            <p className='text-xs text-muted-foreground'>
              PII: {summaryQuery.data?.security?.piiDetected ?? 0} | Injection:{' '}
              {summaryQuery.data?.security?.injectionDetected ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Xu hướng Accuracy: Production vs Evaluation</CardTitle>
        </CardHeader>
        <CardContent className='h-[320px] min-h-[320px]'>
          {chartData.length === 0 ? (
            <div className='flex h-full items-center justify-center text-muted-foreground'>
              {isLoading ? 'Đang tải...' : 'Chưa có dữ liệu'}
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='period'
                  tickFormatter={period =>
                    formatPeriodLabel(period, granularity)
                  }
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  labelFormatter={period =>
                    formatPeriodLabel(period, granularity)
                  }
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='production'
                  name='Production'
                  stroke='#6366f1'
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
                <Line
                  type='monotone'
                  dataKey='evaluation'
                  name='Evaluation'
                  stroke='#22c55e'
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
