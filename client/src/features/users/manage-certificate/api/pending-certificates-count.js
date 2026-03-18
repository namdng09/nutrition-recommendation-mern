import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchPendingCertificatesCount = async () => {
  const response = await apiClient.get('/api/users/pending-certificates/count');
  return response.data.data.count;
};

export const usePendingCertificatesCount = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PENDING_CERTIFICATES_COUNT,
    queryFn: fetchPendingCertificatesCount,
    staleTime: 30_000
  });
};
