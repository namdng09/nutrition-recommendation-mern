import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateDish = async ({ id, data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Only add fields that are explicitly defined in data object
  // This allows partial updates (e.g., only isActive or isPublic)

  if (data.name !== undefined && data.name !== null) {
    formData.append('name', data.name);
  }

  if (data.description !== undefined && data.description !== null) {
    formData.append('description', data.description);
  }

  if (
    data.categories !== undefined &&
    data.categories !== null &&
    data.categories.length > 0
  ) {
    formData.append('categories', JSON.stringify(data.categories));
  }

  if (
    data.nutritionFocus !== undefined &&
    data.nutritionFocus !== null &&
    data.nutritionFocus.length > 0
  ) {
    formData.append('nutritionFocus', JSON.stringify(data.nutritionFocus));
  }

  if (
    data.ingredients !== undefined &&
    data.ingredients !== null &&
    data.ingredients.length > 0
  ) {
    formData.append('ingredients', JSON.stringify(data.ingredients));
  }

  if (
    data.instructions !== undefined &&
    data.instructions !== null &&
    data.instructions.length > 0
  ) {
    formData.append('instructions', JSON.stringify(data.instructions));
  }

  if (data.preparationTime !== undefined && data.preparationTime !== null) {
    formData.append('preparationTime', data.preparationTime.toString());
  }

  if (data.cookTime !== undefined && data.cookTime !== null) {
    formData.append('cookTime', data.cookTime.toString());
  }

  if (data.servings !== undefined && data.servings !== null) {
    formData.append('servings', data.servings.toString());
  }

  if (data.tags !== undefined && data.tags !== null && data.tags.length > 0) {
    formData.append('tags', JSON.stringify(data.tags));
  }

  // Boolean fields - must check explicitly for true/false
  if (data.isActive !== undefined && data.isActive !== null) {
    formData.append('isActive', data.isActive.toString());
  }

  if (data.isPublic !== undefined && data.isPublic !== null) {
    formData.append('isPublic', data.isPublic.toString());
  }

  // DEBUG: Log FormData
  console.log('=== FormData being sent ===');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  const response = await apiClient.put(`/api/dishes/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const useUpdateDish = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDish,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DISH(variables.id)
      });
      onSuccess?.(data);
    },
    onError: error => {
      console.error('Update error:', error.response?.data || error);
      onError?.(error);
    }
  });
};
