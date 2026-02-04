import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchPost = async params => {
  const searchParams = buildQueryParams(params, ['title']);
  const response = await apiClient.get(`/api/posts?${searchParams.toString()}`);
  return response.data.data;
};

export const usePost = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.POSTS, params],
    queryFn: () => fetchPost(params)
  });
};
