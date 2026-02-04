import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchPostDetail = async id => {
  const response = await apiClient.get(`/api/posts/${id}`);
  return response.data.data;
};

export const usePostDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.POST(id),
    queryFn: () => fetchPostDetail(id)
  });
};
