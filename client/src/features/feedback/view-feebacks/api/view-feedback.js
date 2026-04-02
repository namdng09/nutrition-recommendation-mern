import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchFeedbacks = async params => {
  const searchParams = buildQueryParams(params, ['content']);
  const response = await apiClient.get(
    `/api/feedback?${searchParams.toString()}`
  );

  return response.data.data;
};

export const useFeedbacks = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.FEEDBACKS, params],
    queryFn: () => fetchFeedbacks(params)
  });
};
