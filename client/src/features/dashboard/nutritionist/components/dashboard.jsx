import {
  AlertCircle,
  Book,
  BookText,
  ChefHat,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { useNutritionistDashboard } from '~/features/dashboard/api/dashboard';

import DashboardSkeleton from './dashboard-skeleton';

const formatNumber = value => Number(value ?? 0).toLocaleString('vi-VN');

const Dashboard = () => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useNutritionistDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <Card className='border-destructive/30'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <AlertCircle className='size-5' />
            Không thể tải dashboard chuyên gia dinh dưỡng
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

  const overview = data?.overview || {};
  const engagement = data?.engagement || {};

  const metricCards = [
    {
      title: 'Tổng món ăn',
      value: formatNumber(overview.totalDishes),
      description: 'Món ăn bạn đã tạo',
      icon: ChefHat,
      iconTone:
        'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30'
    },
    {
      title: 'Món ăn công khai',
      value: formatNumber(overview.totalPublicDishes),
      description: 'Món ăn hiển thị cho cộng đồng',
      icon: Sparkles,
      iconTone:
        'text-cyan-600 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-950/30'
    },
    {
      title: 'Tổng bài viết',
      value: formatNumber(overview.totalPosts),
      description: 'Bài viết bạn đã tạo',
      icon: BookText,
      iconTone:
        'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/30'
    },
    {
      title: 'Bài viết đã xuất bản',
      value: formatNumber(overview.totalPublishedPosts),
      description: 'Bài viết đang công khai',
      icon: MessageCircle,
      iconTone:
        'text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/30'
    },
    {
      title: 'Bộ sưu tập',
      value: formatNumber(overview.totalCollections),
      description: 'Bộ sưu tập bạn sở hữu',
      icon: Book,
      iconTone:
        'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30'
    }
  ];

  const engagementRows = [
    {
      key: 'views',
      label: 'Tổng lượt xem',
      value: Number(engagement.totalViews || 0),
      icon: Eye,
      iconClass: 'text-blue-600'
    },
    {
      key: 'likes',
      label: 'Tổng lượt thích',
      value: Number(engagement.totalLikes || 0),
      icon: Heart,
      iconClass: 'text-rose-600'
    },
    {
      key: 'comments',
      label: 'Tổng bình luận',
      value: Number(engagement.totalComments || 0),
      icon: MessageCircle,
      iconClass: 'text-emerald-600'
    }
  ];

  const maxEngagement = Math.max(...engagementRows.map(item => item.value), 1);

  return (
    <div className='space-y-6'>
      <Card className='relative overflow-hidden'>
        <div className='pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-2xl' />
        <div className='pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-cyan-500/15 blur-2xl' />
        <CardContent className='relative pt-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Dashboard chuyên gia dinh dưỡng
              </h1>
              <p className='text-sm text-muted-foreground'>
                Tổng quan nội dung và hiệu suất tương tác của bạn.
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>Cập nhật theo thời gian thực</Badge>
              <Button
                variant='outline'
                onClick={() => refetch()}
                disabled={isFetching}
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

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'>
        {metricCards.map(item => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className='border'>
              <CardContent className='pt-6'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-foreground/80'>
                      {item.title}
                    </p>
                    <p className='text-2xl font-semibold'>{item.value}</p>
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${item.iconTone}`}
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

      <Card>
        <CardHeader>
          <CardTitle>Tương tác bài viết</CardTitle>
          <CardDescription>
            Hiển thị toàn bộ chỉ số tương tác từ backend cho các bài viết của
            bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            {engagementRows.map(item => {
              const Icon = item.icon;

              return (
                <div key={item.key} className='space-y-2'>
                  <div className='flex items-center justify-between gap-3 text-sm'>
                    <div className='inline-flex items-center gap-2 font-medium'>
                      <Icon className={`size-4 ${item.iconClass}`} />
                      {item.label}
                    </div>
                    <span className='font-semibold'>
                      {formatNumber(item.value)}
                    </span>
                  </div>
                  <Progress value={(item.value / maxEngagement) * 100} />
                </div>
              );
            })}
          </div>

          <Table className='rounded-lg overflow-hidden'>
            <TableHeader>
              <TableRow>
                <TableHead>Chỉ số</TableHead>
                <TableHead className='text-right'>Giá trị</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engagementRows.map(item => (
                <TableRow key={`row-${item.key}`}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatNumber(item.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
