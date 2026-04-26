import { Eye, Play, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
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

const getResultLabel = isCorrect => {
  return isCorrect ? 'Pass' : 'Fail';
};

const getClassificationLabel = classification => {
  if (!classification) return '--';
  return classification === 'positive' ? 'Positive' : 'Negative';
};

const Page = () => {
  const [source, setSource] = useState('evaluation');
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState([]);
  const [isSelectTestCaseOpen, setIsSelectTestCaseOpen] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState(null);
  const [selectedMetricSource, setSelectedMetricSource] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const testCasesQuery = useAITestCases();
  const [queryKey, setQueryKey] = useState(0);
  const params = source ? { sourceType: source } : {};
  const resultsQuery = useAIEvaluationResults(params, { queryKey: [queryKey] });
  const detailQuery = useAIEvaluationResultDetail(selectedMetricId, {
    enabled: isDetailOpen && Boolean(selectedMetricId)
  });

  // Set source type when detail data is loaded
  useEffect(() => {
    if (detailQuery.data?.sourceType) {
      setSelectedMetricSource(detailQuery.data.sourceType);
    }
  }, [detailQuery.data?.sourceType]);

  const runMutation = useRunAIEvaluations();

  const enabledCount = useMemo(
    () => (testCasesQuery.data || []).filter(item => item.enabled).length,
    [testCasesQuery.data]
  );

  const toggleTestCase = testCaseId => {
    setSelectedTestCaseIds(prev =>
      prev.includes(testCaseId)
        ? prev.filter(id => id !== testCaseId)
        : [...prev, testCaseId]
    );
  };

  const runSelected = async () => {
    try {
      const result = await runMutation.mutateAsync({
        testCaseIds:
          selectedTestCaseIds.length > 0 ? selectedTestCaseIds : undefined
      });
      setLastRun(result);
      setIsSelectTestCaseOpen(false);
      toast.success('Chạy đánh giá thành công');
      resultsQuery.refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Chạy đánh giá thất bại');
    }
  };

  const onViewDetail = metricId => {
    setSelectedMetricId(metricId);
    setSelectedMetricSource(null);
    setIsDetailOpen(true);
  };

  const clearLastRun = () => {
    setLastRun(null);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Chạy đánh giá AI</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='secondary'>{enabledCount} test case</Badge>
            <Badge variant='outline'>
              {resultsQuery.data?.length ?? 0} kết quả
            </Badge>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant={source === 'evaluation' ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                setSource('evaluation');
                setQueryKey(k => k + 1);
              }}
            >
              Evaluation
            </Button>
            <Button
              variant={source === 'production' ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                setSource('production');
                setQueryKey(k => k + 1);
              }}
            >
              Production
            </Button>

            <Button
              variant='outline'
              onClick={() => setIsSelectTestCaseOpen(true)}
            >
              <Play className='mr-2 h-4 w-4' />
              Chọn test case
              {selectedTestCaseIds.length > 0
                ? ` (${selectedTestCaseIds.length})`
                : ''}
            </Button>

            <Button variant='outline' onClick={() => resultsQuery.refetch()}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Làm mới
            </Button>
          </div>

          {lastRun && (
            <div className='relative'>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
                <Card>
                  <CardHeader className='pb-1'>
                    <CardTitle className='text-xs'>Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent className='pb-2'>
                    <p className='text-xl font-bold'>
                      {lastRun.averageAccuracy ?? 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-1'>
                    <CardTitle className='text-xs'>Latency</CardTitle>
                  </CardHeader>
                  <CardContent className='pb-2'>
                    <p className='text-xl font-bold'>
                      {lastRun.averageLatencyMs ?? 0}ms
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-1'>
                    <CardTitle className='text-xs'>Cost</CardTitle>
                  </CardHeader>
                  <CardContent className='pb-2'>
                    <p className='text-xl font-bold'>
                      ${lastRun.totalCostUsd ?? 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-1'>
                    <CardTitle className='text-xs'>Stability</CardTitle>
                  </CardHeader>
                  <CardContent className='pb-2'>
                    <p className='text-xl font-bold'>
                      {lastRun.stability ?? 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-1'>
                    <CardTitle className='text-xs'>Results</CardTitle>
                  </CardHeader>
                  <CardContent className='pb-2'>
                    <p className='text-xl font-bold'>{lastRun.total}</p>
                    <p className='text-xs text-muted-foreground'>
                      Pass: {lastRun.successCount} | Fail: {lastRun.failedCount}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Button
                variant='ghost'
                size='sm'
                className='absolute top-0 right-0'
                onClick={clearLastRun}
              >
                X
              </Button>
            </div>
          )}
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
                <TableHead>Source</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Test case</TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Acc</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead>Phân loại</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead className='text-right'>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(resultsQuery.data || []).map(item => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Badge variant='outline' className='text-xs'>
                      {item.sourceType === 'evaluation' ? 'Eval' : 'Prod'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell>{item?.testCaseName || item.endpoint}</TableCell>
                  <TableCell>{item.ruleScore ?? '-'}</TableCell>
                  <TableCell>{item.semanticScore ?? '-'}</TableCell>
                  <TableCell>{item.accuracyScore ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={item.isCorrect ? 'default' : 'destructive'}>
                      {getResultLabel(item.isCorrect)}
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
                    colSpan={10}
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

      {/* Evaluation Detail Dialog */}
      <Dialog
        open={isDetailOpen && selectedMetricSource === 'evaluation'}
        onOpenChange={open => {
          setIsDetailOpen(open);
          if (!open) {
            setSelectedMetricId(null);
            setSelectedMetricSource(null);
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
                  <span className='font-medium'>Pass threshold:</span> 90
                </p>
                <p>
                  <span className='font-medium'>Semantic score:</span>{' '}
                  {detailQuery.data?.semanticScore ?? 0}
                </p>
                <p>
                  <span className='font-medium'>Rule score:</span>{' '}
                  {detailQuery.data?.ruleScore ?? 0}
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
                  <span className='font-medium'>Latency:</span>{' '}
                  {detailQuery.data?.latencyMs ?? 0}ms
                </p>
                <p>
                  <span className='font-medium'>Tokens:</span>{' '}
                  {(detailQuery.data?.inputTokens ?? 0) +
                    (detailQuery.data?.outputTokens ?? 0)}
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
                <p className='mb-1 text-sm font-medium'>Test Expectation</p>
                <pre className='max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs'>
                  {JSON.stringify(
                    detailQuery.data?.testExpectation || {},
                    null,
                    2
                  )}
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

      {/* Production Detail Dialog */}
      <Dialog
        open={isDetailOpen && selectedMetricSource === 'production'}
        onOpenChange={open => {
          setIsDetailOpen(open);
          if (!open) {
            setSelectedMetricId(null);
            setSelectedMetricSource(null);
          }
        }}
      >
        <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết Production Metric</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết từ production.
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
                  <span className='font-medium'>Endpoint:</span>{' '}
                  {detailQuery.data?.endpoint || '--'}
                </p>
                <p>
                  <span className='font-medium'>Status:</span>{' '}
                  {detailQuery.data?.status || '--'}
                </p>
                <p>
                  <span className='font-medium'>User ID:</span>{' '}
                  {detailQuery.data?.userId || '--'}
                </p>
                <p>
                  <span className='font-medium'>Request ID:</span>{' '}
                  {detailQuery.data?.requestId || '--'}
                </p>
                {detailQuery.data?.isCorrect !== undefined && (
                  <>
                    <p>
                      <span className='font-medium'>Is Correct:</span>{' '}
                      {detailQuery.data?.isCorrect ? 'True' : 'False'}
                    </p>
                    <p>
                      <span className='font-medium'>Accuracy:</span>{' '}
                      {detailQuery.data?.accuracyScore ?? 0}
                    </p>
                    <p>
                      <span className='font-medium'>Rule score:</span>{' '}
                      {detailQuery.data?.ruleScore ?? 0}
                    </p>
                    <p>
                      <span className='font-medium'>Semantic score:</span>{' '}
                      {detailQuery.data?.semanticScore ?? 0}
                    </p>
                  </>
                )}
                <p>
                  <span className='font-medium'>Latency:</span>{' '}
                  {detailQuery.data?.latencyMs ?? 0}ms
                </p>
                <p>
                  <span className='font-medium'>Tokens:</span>{' '}
                  {(detailQuery.data?.inputTokens ?? 0) +
                    (detailQuery.data?.outputTokens ?? 0)}
                </p>
                <p>
                  <span className='font-medium'>Cost:</span> $
                  {detailQuery.data?.estimatedCostUsd ?? '0'}
                </p>
              </div>

              {/* Quality Metadata */}
              {detailQuery.data?.qualityMetadata && (
                <div>
                  <p className='mb-1 text-sm font-medium'>Quality Metadata</p>
                  <pre className='max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs'>
                    {JSON.stringify(detailQuery.data?.qualityMetadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Validation Report */}
              {detailQuery.data?.validationReport && (
                <div>
                  <p className='mb-1 text-sm font-medium'>
                    Validation Report (score:{' '}
                    {detailQuery.data?.validationReport?.overallScore ?? 0})
                  </p>
                  <pre className='max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs'>
                    {JSON.stringify(
                      detailQuery.data?.validationReport,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              {detailQuery.data?.errorMessage ? (
                <p className='text-sm text-destructive'>
                  Lỗi: {detailQuery.data.errorMessage}
                </p>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSelectTestCaseOpen}
        onOpenChange={setIsSelectTestCaseOpen}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Chọn test cases để chạy</DialogTitle>
            <DialogDescription>
              Chưa chọn test case nào. Bỏ trống để bỏ qua test case.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className='h-[400px]'>
            <div className='space-y-2 p-1'>
              {(testCasesQuery.data || []).map(tc => (
                <div
                  key={tc._id}
                  className='flex items-center gap-2 rounded-md border p-2 hover:bg-muted cursor-pointer'
                  onClick={() => toggleTestCase(tc._id)}
                >
                  <Checkbox
                    checked={selectedTestCaseIds.includes(tc._id)}
                    onClick={e => e.stopPropagation()}
                    onCheckedChange={() => toggleTestCase(tc._id)}
                  />
                  <span className='flex-1 text-sm'>{tc.name}</span>
                  <Badge variant='outline' className='text-xs'>
                    {tc.category}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className='flex justify-between'>
            <Button
              variant='outline'
              onClick={() => {
                const enabledIds = (testCasesQuery.data || [])
                  .filter(tc => tc.enabled)
                  .map(tc => tc._id);
                const allSelected =
                  enabledIds.length > 0 &&
                  enabledIds.every(id => selectedTestCaseIds.includes(id));
                setSelectedTestCaseIds(allSelected ? [] : enabledIds);
              }}
            >
              {selectedTestCaseIds.length ===
              (testCasesQuery.data || []).filter(tc => tc.enabled).length
                ? 'Bỏ chọn tất cả'
                : 'Chọn tất cả'}
            </Button>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => setIsSelectTestCaseOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={runSelected}
                disabled={
                  runMutation.isPending || selectedTestCaseIds.length === 0
                }
              >
                <Play className='mr-2 h-4 w-4' />
                {runMutation.isPending ? 'Đang chạy...' : 'Chạy'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
