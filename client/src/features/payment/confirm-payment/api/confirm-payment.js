import { useMutation } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const confirmPayment = async ({ orderCode }) => {
  const response = await apiClient.post(
    `/api/payments/confirm?orderCode=${orderCode}`
  );
  return response.data.data;
};

export const useConfirmPayment = () => {
  return useMutation({
    mutationKey: [...QUERY_KEYS.PAYMENTS, 'confirm'],
    mutationFn: confirmPayment
  });
};
