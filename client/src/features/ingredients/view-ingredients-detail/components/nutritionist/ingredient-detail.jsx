import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Save, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/text-area';
import DeleteIngredientDialog from '~/features/ingredients/delete-ingredient/components/nutritionist/delete-ingredient-dialog';
import { useUpdateIngredient } from '~/features/ingredients/update-ingredient/api/update-ingredient';
import {
  INGREDIENT_CATEGORY_OPTIONS,
  UNIT_OPTIONS,
  updateIngredientSchema
} from '~/features/ingredients/update-ingredient/schemas/update-ingredient-schema';
import { useIngredientDetail } from '~/features/ingredients/view-ingredients-detail/api/view-ingredient-detail';

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

const IngredientDetail = ({ id }) => {
  const navigate = useNavigate();

  const { data: ingredient } = useIngredientDetail(id);
  const { mutate: updateIngredient, isPending: isUpdating } =
    useUpdateIngredient({
      onSuccess: response => {
        toast.success(response.message || 'Cập nhật nguyên liệu thành công');
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Cập nhật nguyên liệu thất bại'
        );
      }
    });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const form = useForm({
    resolver: yupResolver(updateIngredientSchema),
    values: ingredient
      ? {
          name: ingredient.name || '',
          description: ingredient.description || '',
          categories: ingredient.categories || [],
          baseUnit: ingredient.baseUnit || { amount: 100, unit: 'g' },
          units: ingredient.units || [],
          allergens: ingredient.allergens || [],
          nutrition: ingredient.nutrition || {
            nutrients: {
              calories: { value: 0, unit: 'kcal' },
              carbs: { value: 0, unit: 'g' },
              fat: { value: 0, unit: 'g' },
              protein: { value: 0, unit: 'g' },
              fiber: { value: 0, unit: 'g' },
              sodium: { value: 0, unit: 'mg' },
              cholesterol: { value: 0, unit: 'mg' }
            }
          },
          image: ingredient.image || '',
          isActive: ingredient.isActive?.toString() || 'true'
        }
      : undefined
  });

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = data => {
    console.log('Form data being submitted:', data);
    console.log('Form errors:', form.formState.errors);

    const processedData = {
      ...data,
      isActive: data.isActive === 'true' || data.isActive === true
    };

    updateIngredient({ id, data: processedData, image: selectedImage });
  };

  const handleToggleActive = () => {
    updateIngredient({
      id,
      data: { isActive: !ingredient.isActive },
      image: null
    });
  };

  const handleBack = () => {
    navigate('/nutritionist/manage-ingredients');
  };

  const handleDeleteSuccess = () => {
    navigate('/nutritionist/manage-ingredients');
  };

  const handleAddCategory = category => {
    const currentCategories = form.getValues('categories') || [];
    if (!currentCategories.includes(category)) {
      form.setValue('categories', [...currentCategories, category]);
    }
  };

  const handleRemoveCategory = categoryToRemove => {
    const currentCategories = form.getValues('categories') || [];
    const updatedCategories = currentCategories.filter(
      cat => cat !== categoryToRemove
    );
    console.log('Removing category:', categoryToRemove);
    console.log('Updated categories:', updatedCategories);
    form.setValue('categories', updatedCategories, {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  if (!ingredient) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-muted-foreground'>Không tìm thấy nguyên liệu</p>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const nutrients = ingredient?.nutrition?.nutrients;
  const displayImage =
    previewUrl || ingredient?.image || 'https://via.placeholder.com/128';
  const selectedCategories = form.watch('categories') || [];
  const availableCategories = INGREDIENT_CATEGORY_OPTIONS.filter(
    cat => !selectedCategories.includes(cat.value)
  );

  return (
    <div className='max-w-4xl mx-auto'>
      <Button variant='ghost' size='sm' onClick={handleBack} className='mb-4'>
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-start'>
        <div className='relative'>
          <img
            src={displayImage}
            alt={ingredient?.name}
            className='h-32 w-32 object-cover rounded'
          />
          <label className='absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90'>
            <Upload className='h-4 w-4 text-primary-foreground' />
            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className='flex-1 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2'>
            <h2 className='text-2xl font-bold'>{ingredient?.name}</h2>
            <Badge variant={ingredient?.isActive ? 'default' : 'secondary'}>
              {ingredient?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className='flex gap-1 mt-2 flex-wrap justify-center md:justify-start'>
            {selectedCategories?.map((cat, idx) => (
              <Badge key={idx} variant='outline'>
                {cat}
              </Badge>
            ))}
          </div>
          <div className='flex gap-2 mt-2 flex-wrap justify-center md:justify-start'>
            {nutrients?.calories && (
              <Badge variant='outline'>
                {nutrients.calories.value} {nutrients.calories.unit}
              </Badge>
            )}
            {nutrients?.protein && (
              <Badge variant='outline'>
                Protein: {nutrients.protein.value} {nutrients.protein.unit}
              </Badge>
            )}
            {nutrients?.carbs && (
              <Badge variant='outline'>
                Carbs: {nutrients.carbs.value} {nutrients.carbs.unit}
              </Badge>
            )}
            {nutrients?.fat && (
              <Badge variant='outline'>
                Fat: {nutrients.fat.value} {nutrients.fat.unit}
              </Badge>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={ingredient?.isActive ? 'secondary' : 'default'}
            size='sm'
            onClick={handleToggleActive}
            disabled={isUpdating}
          >
            {ingredient?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
          <Button
            size='sm'
            type='button'
            onClick={form.handleSubmit(handleSave)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Spinner className='h-4 w-4 mr-1' />
            ) : (
              <Save className='h-4 w-4 mr-1' />
            )}
            Lưu
          </Button>
        </div>
      </div>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Thông tin nguyên liệu</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className='space-y-6'>
            {/* Basic Info */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên nguyên liệu</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên nguyên liệu' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='categories'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <div className='space-y-3'>
                    <Select onValueChange={handleAddCategory}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn danh mục' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategories.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedCategories.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {selectedCategories.map((cat, idx) => (
                          <Badge
                            key={idx}
                            variant='secondary'
                            className='gap-1 pr-1'
                          >
                            {cat}
                            <button
                              type='button'
                              className='ml-1 hover:bg-secondary-foreground/20 rounded-sm p-0.5'
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveCategory(cat);
                              }}
                            >
                              <X className='h-3 w-3' />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Nhập mô tả nguyên liệu' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nutrition Info */}
            <div className='space-y-4'>
              <h3 className='text-md font-semibold'>Thông tin dinh dưỡng</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
                <FormField
                  control={form.control}
                  name='nutrition.nutrients.calories.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.protein.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.carbs.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.fat.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.fiber.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber (g)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.sodium.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.cholesterol.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cholesterol (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>

        <div className='flex justify-start items-center mt-6 pt-6 border-t'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa nguyên liệu
          </Button>
        </div>
      </div>

      <DeleteIngredientDialog
        ingredient={ingredient}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default IngredientDetail;
