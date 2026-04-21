import { Eye, Play, RefreshCw, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import {
  useAIEvaluationResultDetail,
  useAIEvaluationResults,
  useAITestCases,
  useRunAIEvaluations
} from '~/features/ai-evaluation/api/ai-evaluation';

const formatDateTime = value => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN');
};

const getResultLabel = (isCorrect, evaluation) => {
  if (evaluation?.isErrorResponse) return 'Error';
  return isCorrect ? 'Pass' : 'Fail';
};

const getClassificationLabel = classification => {
  if (!classification) return '--';
  return classification === 'positive' ? 'Positive' : 'Negative';
};

const Page = () => {
  const [lastRun, setLastRun] = useState(null);
  const [selectedMetricId, setSelectedMetricId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [enableLLMJudge, setEnableLLMJudge] = useState(false);
  const testCasesQuery = useAITestCases();
  const resultsQuery = useAIEvaluationResults({ source: 'evaluation' });
  const detailQuery = useAIEvaluationResultDetail(selectedMetricId, {
    enabled: isDetailOpen && Boolean(selectedMetricId)
  });
  const runMutation = useRunAIEvaluations();

  const enabledCount = useMemo(
    () => (testCasesQuery.data || []).filter(item => item.enabled).length,
    [testCasesQuery.data]
  );

  const runAll = async () => {
    try {
      const result = await runMutation.mutateAsync({ enableLLMJudge });
      setLastRun(result);
      toast.success('Chạy đánh giá thành công');
      resultsQuery.refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Chạy đánh giá thất bại');
    }
  };

  const onViewDetail = metricId => {
    setSelectedMetricId(metricId);
    setIsDetailOpen(true);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Chạy đánh giá AI</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='secondary'>{enabledCount} test case đang bật</Badge>
            <Badge variant='outline'>
              {resultsQuery.data?.length ?? 0} kết quả gần nhất
            </Badge>
          </div>

          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={enableLLMJudge}
              onChange={e => setEnableLLMJudge(e.target.checked)}
              className='h-4 w-4 rounded border-gray-300'
            />
            <Sparkles className='h-4 w-4 text-amber-500' />
            Sử dụng LLM Judge (chậm hơn, tốn phí)
          </label>

          <div className='flex flex-wrap gap-2'>
            <Button
              onClick={runAll}
              disabled={runMutation.isPending || enabledCount === 0}
            >
              <Play className='mr-2 h-4 w-4' />
              {runMutation.isPending
                ? 'Đang chạy...'
                : 'Chạy tất cả test cases'}
            </Button>

            <Button variant='outline' onClick={() => resultsQuery.refetch()}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Làm mới kết quả
            </Button>
          </div>

          {lastRun ? (
            <div className='rounded-md border p-3 text-sm'>
              <p>Tổng: {lastRun.total}</p>
              <p>Đúng: {lastRun.successCount}</p>
              <p>Sai: {lastRun.failedCount}</p>
              <p>Accuracy trung bình: {lastRun.averageAccuracy}%</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kết quả đánh giá gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Test case</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead>Phân loại</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead className='text-right'>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(resultsQuery.data || []).map(item => (
                <TableRow key={item._id}>
                  <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell>
                    {item?.testCaseName ||
                      item?.meta?.testCaseName ||
                      item.endpoint}
                  </TableCell>
                  <TableCell>{item.accuracyScore ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={item.isCorrect ? 'default' : 'destructive'}>
                      {getResultLabel(item.isCorrect, item.evaluation)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>
                      {getClassificationLabel(item.classification)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.latencyMs ?? 0}ms</TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onViewDetail(item._id)}
                      aria-label='Xem chi tiết kết quả'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {!resultsQuery.isLoading &&
              (resultsQuery.data || []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center text-muted-foreground'
                  >
                    Chưa có dữ liệu đánh giá.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isDetailOpen}
        onOpenChange={open => {
          setIsDetailOpen(open);
          if (!open) {
            setSelectedMetricId(null);
          }
        }}
      >
        <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết kết quả đánh giá</DialogTitle>
            <DialogDescription>
              Xem prompt, expected, response và breakdown điểm.
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <p className='text-sm text-muted-foreground'>
              Đang tải chi tiết...
            </p>
          ) : detailQuery.isError ? (
            <p className='text-sm text-destructive'>
              Không tải được chi tiết kết quả.
            </p>
          ) : (
            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <p>
                  <span className='font-medium'>Test case:</span>{' '}
                  {detailQuery.data?.testCaseName || '--'}
                </p>
                <p>
                  <span className='font-medium'>Endpoint:</span>{' '}
                  {detailQuery.data?.endpoint || '--'}
                </p>
                <p>
                  <span className='font-medium'>Rule score:</span>{' '}
                  {detailQuery.data?.ruleScore ?? 0}
                </p>
                <p>
                  <span className='font-medium'>Semantic score:</span>{' '}
                  {detailQuery.data?.semanticScore ?? 0}
                </p>
                <p>
                  <span className='font-medium'>Accuracy:</span>{' '}
                  {detailQuery.data?.accuracyScore ?? 0}
                </p>
                <p>
                  <span className='font-medium'>Kết quả:</span>{' '}
                  {detailQuery.data?.isCorrect ? 'True' : 'False'}
                </p>
                <p>
                  <span className='font-medium'>Checks:</span>{' '}
                  {detailQuery.data?.evaluation?.passedChecks ?? 0}/
                  {detailQuery.data?.evaluation?.totalChecks ?? 0}
                </p>
                <p>
                  <span className='font-medium'>Latency:</span>{' '}
                  {detailQuery.data?.latencyMs ?? 0}ms
                </p>
                <p>
                  <span className='font-medium'>Tokens:</span>{' '}
                  {detailQuery.data?.totalTokens ?? 0}
                </p>
                <p>
                  <span className='font-medium'>Cost:</span> $
                  {detailQuery.data?.estimatedCostUsd ?? '0'}
                </p>
              </div>

              <div>
                <p className='mb-1 text-sm font-medium'>Prompt</p>
                <pre className='max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs'>
                  {detailQuery.data?.prompt || '--'}
                </pre>
              </div>

              <div>
                <p className='mb-1 text-sm font-medium'>Expected</p>
                <pre className='max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs'>
                  {JSON.stringify(detailQuery.data?.expected || {}, null, 2)}
                </pre>
              </div>

              <div>
                <p className='mb-1 text-sm font-medium'>Response</p>
                <pre className='max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs'>
                  {detailQuery.data?.response || '--'}
                </pre>
              </div>

              {detailQuery.data?.errorMessage ? (
                <p className='text-sm text-destructive'>
                  Lỗi: {detailQuery.data.errorMessage}
                </p>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
