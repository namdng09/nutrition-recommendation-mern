import { useMutation } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';

export const login = async data => {
  const response = await apiClient.post('/api/auth/login', data);
  return response.data;
};

export const useLogin = ({ onSuccess, onError } = {}) => {
  return useMutation({
    mutationFn: login,
    onSuccess,
    onError
  });
};
