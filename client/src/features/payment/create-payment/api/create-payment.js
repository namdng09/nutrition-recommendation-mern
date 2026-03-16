import { useMutation } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createPayment = async payload => {
  const formData = new FormData();
  formData.append('amount', String(payload.amount));
  formData.append('description', payload.description);
  formData.append('returnUrl', payload.returnUrl);
  formData.append('cancelUrl', payload.cancelUrl);
  formData.append('targetMembership', payload.targetMembership);

  const response = await apiClient.post('/api/payments/', formData);
  return response.data.data;
};

export const useCreatePayment = () => {
  return useMutation({
    mutationKey: [...QUERY_KEYS.PAYMENTS, 'create'],
    mutationFn: createPayment
  });
};
