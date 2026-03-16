import { useMutation, useQueryClient } from '@tanstack/react-query';

import { NUTRITION_UNITS } from '~/features/dishes/update-dish/schemas/update-dish-schema';
import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateDish = async ({ id, data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Basic fields
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

  // Transform ingredients - remove extra fields
  if (
    data.ingredients !== undefined &&
    data.ingredients !== null &&
    data.ingredients.length > 0
  ) {
    const transformedIngredients = data.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      units: ing.units
    }));
    formData.append('ingredients', JSON.stringify(transformedIngredients));
  }

  if (
    data.instructions !== undefined &&
    data.instructions !== null &&
    data.instructions.length > 0
  ) {
    formData.append('instructions', JSON.stringify(data.instructions));
  }

  // Transform nutrition from object to array format
  if (data.nutrition !== undefined && data.nutrition !== null) {
    const nutrients = [];
    const minerals = [];
    const vitamins = [];

    // Process nutrients
    if (data.nutrition.nutrients) {
      for (const [label, value] of Object.entries(data.nutrition.nutrients)) {
        if (value && value > 0) {
          nutrients.push({
            label,
            value: Number(value),
            unit: NUTRITION_UNITS[label] || 'g'
          });
        }
      }
    }

    // Process minerals
    if (data.nutrition.minerals) {
      for (const [label, value] of Object.entries(data.nutrition.minerals)) {
        if (value && value > 0) {
          minerals.push({
            label,
            value: Number(value),
            unit: NUTRITION_UNITS[label] || 'mg'
          });
        }
      }
    }

    // Process vitamins
    if (data.nutrition.vitamins) {
      for (const [label, value] of Object.entries(data.nutrition.vitamins)) {
        if (value && value > 0) {
          vitamins.push({
            label,
            value: Number(value),
            unit: NUTRITION_UNITS[label] || 'mg'
          });
        }
      }
    }

    if (nutrients.length > 0 || minerals.length > 0 || vitamins.length > 0) {
      const transformedNutrition = {
        nutrients: nutrients.length > 0 ? nutrients : undefined,
        minerals: minerals.length > 0 ? minerals : undefined,
        vitamins: vitamins.length > 0 ? vitamins : undefined
      };
      formData.append('nutrition', JSON.stringify(transformedNutrition));
    }
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

  // Boolean fields
  if (data.isActive !== undefined && data.isActive !== null) {
    formData.append('isActive', data.isActive.toString());
  }

  if (data.isPublic !== undefined && data.isPublic !== null) {
    formData.append('isPublic', data.isPublic.toString());
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
