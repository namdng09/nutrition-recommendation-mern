import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const buildFormData = data => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  return formData;
};

const updateNutritionistProfile = async data => {
  const formData = buildFormData(data);

  const response = await apiClient.put(
    '/api/users/me/nutritionist-profile',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

const updateUserNutritionistProfile = async ({ id, data }) => {
  const formData = buildFormData(data);

  const response = await apiClient.put(
    `/api/users/${id}/nutritionist-profile`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

export const useUpdateNutritionistProfile = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNutritionistProfile,
    onSuccess: response => {
      queryClient.setQueryData(QUERY_KEYS.PROFILE, response.data);
      onSuccess?.(response);
    },
    onError
  });
};

export const useUpdateUserNutritionistProfile = ({
  onSuccess,
  onError
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserNutritionistProfile,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: ['user', onSuccess?._id] });
      onSuccess?.(response);
    },
    onError
  });
};
