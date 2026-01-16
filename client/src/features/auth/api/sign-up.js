import { useMutation } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';

export const signUp = async formData => {
  const response = await apiClient.post('/api/auth/sign-up', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const useSignUp = ({ onSuccess, onError } = {}) => {
  return useMutation({
    mutationFn: signUp,
    onSuccess,
    onError
  });
};
