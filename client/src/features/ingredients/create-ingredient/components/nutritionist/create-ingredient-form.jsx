import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Upload, X } from 'lucide-react';
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
import { Textarea } from '~/components/ui/text-area';
import { useCreateIngredient } from '~/features/ingredients/create-ingredient/api/create-ingredient';
import {
  createIngredientSchema,
  INGREDIENT_CATEGORY_OPTIONS,
  UNIT_OPTIONS
} from '~/features/ingredients/create-ingredient/schemas/create-ingredient-schema';

const CreateIngredientForm = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const form = useForm({
    resolver: yupResolver(createIngredientSchema),
    defaultValues: {
      name: '',
      description: '',
      categories: [],
      baseUnit: { amount: 100, unit: 'g' },
      units: [],
      allergens: [],
      nutrition: {
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
      isActive: true
    }
  });

  const { mutate: createIngredient, isPending } = useCreateIngredient({
    onSuccess: response => {
      form.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      toast.success(response.message || 'Tạo nguyên liệu thành công');
      navigate('/nutritionist/manage-ingredients');
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Tạo nguyên liệu thất bại');
    }
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

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleAddCategory = category => {
    const currentCategories = form.getValues('categories') || [];
    if (!currentCategories.includes(category)) {
      form.setValue('categories', [...currentCategories, category]);
    }
  };

  const handleRemoveCategory = categoryToRemove => {
    const currentCategories = form.getValues('categories') || [];
    form.setValue(
      'categories',
      currentCategories.filter(cat => cat !== categoryToRemove)
    );
  };

  const onSubmit = data => {
    console.log('Submitting data:', data);
    createIngredient({ data, image: selectedImage });
  };

  const selectedCategories = form.watch('categories') || [];
  const availableCategories = INGREDIENT_CATEGORY_OPTIONS.filter(
    cat => !selectedCategories.includes(cat.value)
  );

  return (
    <div className='max-w-4xl mx-auto'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate('/nutritionist/manage-ingredients')}
        className='mb-4'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Tạo nguyên liệu mới</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Image Upload */}
            <FormItem>
              <FormLabel>Hình ảnh</FormLabel>
              <div className='flex items-center gap-4'>
                {previewUrl ? (
                  <div className='relative'>
                    <img
                      src={previewUrl}
                      alt='Preview'
                      className='h-32 w-32 object-cover rounded'
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute -top-2 -right-2 h-6 w-6'
                      onClick={handleRemoveImage}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <label className='h-32 w-32 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-primary'>
                    <Upload className='h-8 w-8 text-muted-foreground' />
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </FormItem>

            {/* Basic Info */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên nguyên liệu{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên nguyên liệu' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='baseUnit.amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Số lượng cơ bản{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='100'
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

            <FormField
              control={form.control}
              name='baseUnit.unit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Đơn vị cơ bản <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn đơn vị' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNIT_OPTIONS.map(option => (
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

            {/* Categories */}
            <FormField
              control={form.control}
              name='categories'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Danh mục <span className='text-destructive'>*</span>
                  </FormLabel>
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
              <h3 className='text-md font-semibold'>
                Thông tin dinh dưỡng <span className='text-destructive'>*</span>
              </h3>
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

            <div className='flex justify-end gap-4 pt-6 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/nutritionist/manage-ingredients')}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Đang tạo...' : 'Tạo nguyên liệu'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateIngredientForm;
