import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

export const ADMIN_DASHBOARD_RANGE_VALUES = [
  'today',
  'yesterday',
  'last7days',
  'last30days',
  'thisMonth',
  'lastMonth',
  'thisYear',
  'allTime',
  'custom'
];

const fetchAdminDashboard = async params => {
  const queryParams = buildQueryParams(params);
  const suffix = queryParams.toString();
  const url = suffix
    ? `/api/dashboard/admin?${queryParams.toString()}`
    : '/api/dashboard/admin';

  const response = await apiClient.get(url);
  return response.data.data;
};

const fetchNutritionistDashboard = async () => {
  const response = await apiClient.get('/api/dashboard/nutritionist');
  return response.data.data;
};

export const useAdminDashboard = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_DASHBOARD, params],
    queryFn: () => fetchAdminDashboard(params),
    ...options
  });
};

export const useNutritionistDashboard = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.NUTRITIONIST_DASHBOARD,
    queryFn: fetchNutritionistDashboard,
    ...options
  });
};
