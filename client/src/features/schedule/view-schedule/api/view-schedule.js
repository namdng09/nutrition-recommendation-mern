import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchSchedules = async params => {
  const searchParams = buildQueryParams(params);
  const response = await apiClient.get(
    `/api/schedules?${searchParams.toString()}`
  );
  return response.data.data;
};

export const useSchedules = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.SCHEDULES, params],
    queryFn: () => fetchSchedules(params)
  });
};
