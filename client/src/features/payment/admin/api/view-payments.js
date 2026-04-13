import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchPayments = async params => {
  const queryParams = buildQueryParams(params);
  const suffix = queryParams.toString();
  const url = suffix ? `/api/payments?${suffix}` : '/api/payments';

  const response = await apiClient.get(url);
  return response.data.data;
};

const updatePaymentStatus = async ({
  orderCode,
  status,
  cancellationReason
}) => {
  const formData = new FormData();
  formData.append('status', status);

  if (cancellationReason?.trim()) {
    formData.append('cancellationReason', cancellationReason.trim());
  }

  const response = await apiClient.put(`/api/payments/${orderCode}`, formData);
  return response.data;
};

export const usePayments = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS, 'admin', params],
    queryFn: () => fetchPayments(params)
  });
};

export const useUpdatePaymentStatus = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...QUERY_KEYS.PAYMENTS, 'admin', 'update-status'],
    mutationFn: updatePaymentStatus,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
      onSuccess?.(response);
    },
    onError
  });
};
