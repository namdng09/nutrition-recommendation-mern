import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updatePrivateDish = async ({ id, dishData }) => {
  const formData = new FormData();

  formData.append('name', dishData.name || '');
  formData.append('description', dishData.description || '');
  formData.append('preparationTime', String(dishData.preparationTime || 0));
  formData.append('cookTime', String(dishData.cookTime || 0));
  formData.append('servings', String(dishData.servings || 1));
  formData.append('isActive', String(dishData.isActive ?? true));
  formData.append('isPublic', 'false');

  if (dishData.image instanceof File) {
    formData.append('image', dishData.image);
  }

  formData.append('categories', JSON.stringify(dishData.categories || []));
  formData.append(
    'nutritionFocus',
    JSON.stringify(dishData.nutritionFocus || [])
  );
  formData.append('tags', JSON.stringify(dishData.tags || []));
  formData.append('ingredients', JSON.stringify(dishData.ingredients || []));
  formData.append('instructions', JSON.stringify(dishData.instructions || []));
  formData.append(
    'nutrition',
    JSON.stringify(
      dishData.nutrition || {
        nutrients: [],
        minerals: [],
        vitamins: []
      }
    )
  );

  const response = await apiClient.put(`/api/dishes/private/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const useUpdatePrivateDish = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrivateDish,
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES });
      toast.success(res.message || 'Cập nhật món ăn riêng thành công');
      onSuccess?.(res.data);
    },
    onError: err => {
      toast.error(
        err.response?.data?.message || 'Cập nhật món ăn riêng thất bại'
      );
    }
  });
};
