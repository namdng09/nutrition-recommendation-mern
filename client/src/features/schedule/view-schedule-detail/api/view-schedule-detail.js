import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchScheduleDetail = async id => {
  const response = await apiClient.get(`/api/schedules/${id}`);
  return response.data.data;
};

export const useScheduleDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.SCHEDULE(id),
    queryFn: () => fetchScheduleDetail(id)
  });
};
