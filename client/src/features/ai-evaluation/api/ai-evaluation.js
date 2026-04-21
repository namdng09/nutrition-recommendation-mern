import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchMetricsSummary = async params => {
  const query = buildQueryParams(params || {});
  const url = query.toString()
    ? `/api/ai-evaluation/metrics/summary?${query.toString()}`
    : '/api/ai-evaluation/metrics/summary';
  const response = await apiClient.get(url);
  return response.data.data;
};

const fetchMetricsTrends = async params => {
  const query = buildQueryParams(params || {});
  const url = query.toString()
    ? `/api/ai-evaluation/metrics/trends?${query.toString()}`
    : '/api/ai-evaluation/metrics/trends';
  const response = await apiClient.get(url);
  return response.data.data;
};

const fetchMetricsBySource = async params => {
  const query = buildQueryParams(params || {});
  const url = query.toString()
    ? `/api/ai-evaluation/metrics/by-source?${query.toString()}`
    : '/api/ai-evaluation/metrics/by-source';
  const response = await apiClient.get(url);
  return response.data.data;
};

const fetchTestCases = async () => {
  const response = await apiClient.get('/api/ai-evaluation/test-cases');
  return response.data.data;
};

const createTestCase = async payload => {
  const response = await apiClient.post(
    '/api/ai-evaluation/test-cases',
    payload
  );
  return response.data.data;
};

const updateTestCase = async ({ id, payload }) => {
  const response = await apiClient.put(
    `/api/ai-evaluation/test-cases/${id}`,
    payload
  );
  return response.data.data;
};

const deleteTestCase = async id => {
  const response = await apiClient.delete(
    `/api/ai-evaluation/test-cases/${id}`
  );
  return response.data.data;
};

const runEvaluations = async payload => {
  const response = await apiClient.post(
    '/api/ai-evaluation/evaluations/run',
    payload,
    {
      timeout: 240000
    }
  );
  return response.data.data;
};

const fetchEvaluationResults = async params => {
  const query = buildQueryParams(params || {});
  const url = query.toString()
    ? `/api/ai-evaluation/evaluations/results?${query.toString()}`
    : '/api/ai-evaluation/evaluations/results';
  const response = await apiClient.get(url);
  return response.data.data;
};

const fetchEvaluationResultDetail = async metricId => {
  const response = await apiClient.get(
    `/api/ai-evaluation/evaluations/results/${metricId}/detail`
  );
  return response.data.data;
};

export const useAIMetricsSummary = (params = {}, options = {}) =>
  useQuery({
    queryKey: [...QUERY_KEYS.AI_METRICS_SUMMARY, params],
    queryFn: () => fetchMetricsSummary(params),
    ...options
  });

export const useAIMetricsTrends = (params = {}, options = {}) =>
  useQuery({
    queryKey: [...QUERY_KEYS.AI_METRICS_TRENDS, params],
    queryFn: () => fetchMetricsTrends(params),
    ...options
  });

export const useAIMetricsBySource = (params = {}, options = {}) =>
  useQuery({
    queryKey: [...QUERY_KEYS.AI_METRICS_BY_SOURCE, params],
    queryFn: () => fetchMetricsBySource(params),
    ...options
  });

export const useAITestCases = (options = {}) =>
  useQuery({
    queryKey: QUERY_KEYS.AI_TEST_CASES,
    queryFn: fetchTestCases,
    ...options
  });

export const useCreateAITestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTestCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI_TEST_CASES });
    }
  });
};

export const useUpdateAITestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTestCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI_TEST_CASES });
    }
  });
};

export const useDeleteAITestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTestCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI_TEST_CASES });
    }
  });
};

export const useRunAIEvaluations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runEvaluations,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.AI_EVALUATION_RESULTS
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.AI_METRICS_SUMMARY
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI_METRICS_TRENDS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.AI_METRICS_BY_SOURCE
      });
    }
  });
};

export const useAIEvaluationResults = (params = {}, options = {}) =>
  useQuery({
    queryKey: [...QUERY_KEYS.AI_EVALUATION_RESULTS, params],
    queryFn: () => fetchEvaluationResults(params),
    ...options
  });

export const useAIEvaluationResultDetail = (metricId, options = {}) =>
  useQuery({
    queryKey: QUERY_KEYS.AI_EVALUATION_RESULT_DETAIL(metricId),
    queryFn: () => fetchEvaluationResultDetail(metricId),
    enabled: Boolean(metricId),
    ...options
  });
