import { useMutation } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';

export const forgotPassword = async data => {
  const response = await apiClient.post('/api/auth/forgot-password', data);
  return response.data;
};

export const useForgotPassword = ({ onSuccess, onError } = {}) => {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess,
    onError
  });
};
