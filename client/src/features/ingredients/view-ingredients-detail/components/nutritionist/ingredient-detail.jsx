import { yupResolver } from '@hookform/resolvers/yup';
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Save,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/text-area';
import { ALLERGEN_GROUPS, ALLERGEN_OPTIONS } from '~/constants/allergen';
import DeleteIngredientDialog from '~/features/ingredients/delete-ingredient/components/nutritionist/delete-ingredient-dialog';
import { useUpdateIngredient } from '~/features/ingredients/update-ingredient/api/update-ingredient';
import {
  INGREDIENT_CATEGORY_OPTIONS,
  MINERAL_OPTIONS,
  NUTRIENT_OPTIONS,
  updateIngredientSchema,
  VITAMIN_OPTIONS
} from '~/features/ingredients/update-ingredient/schemas/update-ingredient-schema';
import { useIngredientDetail } from '~/features/ingredients/view-ingredients-detail/api/view-ingredient-detail';

import IngredientDetailSkeleton from './ingredient-detail-skeleton';

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

const COLORS = {
  protein: '#a855f7',
  carbs: '#eab308',
  fat: '#06b6d4'
};

const IngredientDetail = ({ id }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOptionalNutritionOpen, setIsOptionalNutritionOpen] = useState(false);

  const { data: ingredient } = useIngredientDetail(id);

  const { mutate: updateIngredient, isPending: isUpdating } =
    useUpdateIngredient({
      onSuccess: response => {
        setSelectedImage(null);
        setPreviewUrl(null);
        toast.success(response.message || 'Cập nhật nguyên liệu thành công');
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Cập nhật nguyên liệu thất bại'
        );
      }
    });

  // Helper function để map nutrients array sang các field cụ thể
  const getNutrientValue = (nutrients, label, defaultValue = '') => {
    const nutrient = nutrients?.find(n => n.label === label);
    return nutrient?.value ?? defaultValue;
  };

  const form = useForm({
    resolver: yupResolver(updateIngredientSchema),
    values: ingredient
      ? {
          name: ingredient.name || '',
          description: ingredient.description || '',
          categories: ingredient.categories || [],
          baseUnit: ingredient.baseUnit || { amount: 100, unit: 'g' },
          units: ingredient.units || [
            { value: 100, unit: 'g', isDefault: false }
          ],
          allergens: ingredient.allergens || [],
          nutrition: {
            nutrients:
              NUTRIENT_OPTIONS.map(opt => ({
                label: opt.value,
                value:
                  getNutrientValue(
                    ingredient.nutrition?.nutrients,
                    opt.value
                  ) || '',
                unit: opt.unit
              })) || [],
            // SỬA: Tạo array đầy đủ với label và unit đúng
            minerals: MINERAL_OPTIONS.map((opt, index) => {
              const existing = ingredient.nutrition?.minerals?.find(
                m => m.label === opt.value
              );
              return {
                label: opt.value,
                value: existing?.value ?? '',
                unit: 'mg'
              };
            }),
            vitamins: VITAMIN_OPTIONS.map((opt, index) => {
              const existing = ingredient.nutrition?.vitamins?.find(
                v => v.label === opt.value
              );
              return {
                label: opt.value,
                value: existing?.value ?? '',
                unit: 'μg'
              };
            })
          },
          image: ingredient.image || '',
          isActive: ingredient.isActive?.toString() || 'true'
        }
      : undefined
  });

  // GIỮ LẠI useFieldArray cho UI
  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit
  } = useFieldArray({
    control: form.control,
    name: 'units'
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
    const parseNumberValue = value => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    };

    const removeEmptyValues = arr => {
      return arr
        .map(item => {
          const parsedValue = parseNumberValue(item.value);
          return {
            label: item.label,
            value: parsedValue,
            unit: item.unit
          };
        })
        .filter(item => {
          return (
            item.value !== undefined && item.value !== null && item.value >= 0
          );
        });
    };

    // XÓA units khỏi data trước khi submit
    const { units, ...dataWithoutUnits } = data;

    const cleanedData = {
      ...dataWithoutUnits,
      nutrition: {
        nutrients: removeEmptyValues(data.nutrition.nutrients || []),
        minerals: removeEmptyValues(data.nutrition.minerals || []),
        vitamins: removeEmptyValues(data.nutrition.vitamins || [])
      }
    };

    console.log('Submitting cleaned data:', cleanedData);
    updateIngredient({ id, data: cleanedData, image: selectedImage });
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
    form.setValue(
      'categories',
      currentCategories.filter(cat => cat !== categoryToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handleAddAllergen = allergen => {
    const currentAllergens = form.getValues('allergens') || [];
    if (!currentAllergens.includes(allergen)) {
      form.setValue('allergens', [...currentAllergens, allergen]);
    }
  };

  const handleRemoveAllergen = allergenToRemove => {
    const currentAllergens = form.getValues('allergens') || [];
    form.setValue(
      'allergens',
      currentAllergens.filter(a => a !== allergenToRemove)
    );
  };

  const handleAddServingSize = () => {
    appendUnit({ value: '', unit: '', isDefault: false });
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

  // Tính toán macronutrients từ nutrients array
  const nutrients = ingredient?.nutrition?.nutrients || [];
  const protein = getNutrientValue(nutrients, 'Protein', 0);
  const carbs = getNutrientValue(nutrients, 'Tinh bột', 0);
  const fat = getNutrientValue(nutrients, 'Chất béo', 0);

  const macronutrients = [
    { name: 'Protein', value: protein, color: COLORS.protein },
    { name: 'Tinh bột', value: carbs, color: COLORS.carbs },
    { name: 'Chất béo', value: fat, color: COLORS.fat }
  ].filter(item => item.value > 0);

  const totalMacros = macronutrients.reduce((sum, item) => sum + item.value, 0);

  const displayImage =
    previewUrl || ingredient?.image || 'https://via.placeholder.com/128';
  const selectedCategories = form.watch('categories') || [];
  const availableCategories = INGREDIENT_CATEGORY_OPTIONS.filter(
    cat => !selectedCategories.includes(cat.value)
  );

  const selectedAllergens = form.watch('allergens') || [];
  const availableAllergens = ALLERGEN_OPTIONS.filter(
    allergen => !selectedAllergens.includes(allergen.value)
  );

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Button variant='ghost' size='sm' onClick={handleBack} className='mb-4'>
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      {/* Profile Card - GIỮ NGUYÊN CẤU TRÚC VÀ VỊ TRÍ BUTTON */}
      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-start'>
        <div className='relative'>
          <img
            src={displayImage}
            alt={ingredient?.name}
            className='h-32 w-32 object-cover rounded-lg'
          />
          <label className='absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors'>
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
          <div className='flex items-center justify-center md:justify-start gap-2 mb-2'>
            <h2 className='text-2xl font-bold'>{ingredient?.name}</h2>
            <Badge variant={ingredient?.isActive ? 'default' : 'secondary'}>
              {ingredient?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className='flex gap-1.5 flex-wrap justify-center md:justify-start mb-3'>
            {selectedCategories?.map((cat, idx) => (
              <Badge key={idx} variant='outline'>
                {cat}
              </Badge>
            ))}
          </div>

          <div className='flex gap-2 flex-wrap justify-center md:justify-start'>
            {getNutrientValue(nutrients, 'Năng lượng') > 0 && (
              <Badge variant='outline'>
                {getNutrientValue(nutrients, 'Năng lượng')} kcal
              </Badge>
            )}
            {protein > 0 && (
              <Badge variant='outline' className='bg-purple-500/10'>
                Protein: {protein}g
              </Badge>
            )}
            {carbs > 0 && (
              <Badge variant='outline' className='bg-yellow-500/10'>
                Carbs: {carbs}g
              </Badge>
            )}
            {fat > 0 && (
              <Badge variant='outline' className='bg-cyan-500/10'>
                Fat: {fat}g
              </Badge>
            )}
          </div>
        </div>

        {/* GIỮ NGUYÊN VỊ TRÍ VÀ LAYOUT CỦA BUTTONS */}
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

      {/* Nutrition Chart - GIỮ NGUYÊN */}
      {totalMacros > 0 && (
        <div className='bg-card rounded-lg border p-6 mb-6'>
          <h3 className='text-lg font-semibold mb-4'>Nutrition</h3>
          <div className='flex flex-col md:flex-row items-center gap-6'>
            <div className='w-full md:w-64 h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={macronutrients}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {macronutrients.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='flex-1 space-y-3'>
              <p className='text-sm text-muted-foreground'>
                For {ingredient.baseUnit?.amount || 100}{' '}
                {ingredient.baseUnit?.unit || 'g'}
              </p>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-lg font-semibold'>Calories</span>
                  </div>
                  <span className='text-lg font-bold'>
                    {getNutrientValue(nutrients, 'Năng lượng', 0)}
                  </span>
                </div>

                {macronutrients.map((macro, idx) => {
                  const percentage =
                    totalMacros > 0
                      ? ((macro.value / totalMacros) * 100).toFixed(0)
                      : 0;
                  return (
                    <div
                      key={idx}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{ backgroundColor: macro.color }}
                        />
                        <span className='text-sm font-medium'>
                          {macro.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm text-muted-foreground'>
                          {percentage}%
                        </span>
                        <span className='text-sm font-semibold min-w-[3rem] text-right'>
                          {macro.value}g
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className='my-3' />

              <div className='space-y-1.5'>
                {getNutrientValue(nutrients, 'Chất xơ') > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Fiber</span>
                    <span className='font-medium'>
                      {getNutrientValue(nutrients, 'Chất xơ')}g
                    </span>
                  </div>
                )}
                {getNutrientValue(nutrients, 'Natri') > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Sodium</span>
                    <span className='font-medium'>
                      {getNutrientValue(nutrients, 'Natri')}mg
                    </span>
                  </div>
                )}
                {getNutrientValue(nutrients, 'Cholesterol') > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Cholesterol</span>
                    <span className='font-medium'>
                      {getNutrientValue(nutrients, 'Cholesterol')}mg
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-6'>Thông tin nguyên liệu</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className='space-y-6'>
            {/* Basic Info */}
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Trứng gà' {...field} />
                    </FormControl>
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
                      <Textarea
                        placeholder='Ví dụ: Trứng gà tươi, nguyên quả'
                        className='resize-none'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
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
                  name='isActive'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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

              {/* Allergens field */}
              <FormField
                control={form.control}
                name='allergens'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chất gây dị ứng</FormLabel>
                    <div className='space-y-3'>
                      <Select onValueChange={handleAddAllergen}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn chất gây dị ứng...' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ALLERGEN_GROUPS.map(group => (
                            <SelectGroup key={group.category}>
                              <SelectLabel>{group.category}</SelectLabel>
                              {group.options
                                .filter(opt =>
                                  availableAllergens.some(
                                    a => a.value === opt.value
                                  )
                                )
                                .map(allergen => (
                                  <SelectItem
                                    key={allergen.value}
                                    value={allergen.value}
                                  >
                                    {allergen.label}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedAllergens.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {selectedAllergens.map(allergen => {
                            const allergenOption = ALLERGEN_OPTIONS.find(
                              opt => opt.value === allergen
                            );
                            return (
                              <Badge
                                key={allergen}
                                variant='secondary'
                                className='gap-1 pr-1'
                              >
                                {allergenOption?.label || allergen}
                                <button
                                  type='button'
                                  className='ml-1 hover:bg-secondary-foreground/20 rounded-sm p-0.5'
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveAllergen(allergen);
                                  }}
                                >
                                  <X className='h-3 w-3' />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Base Unit */}
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-semibold mb-1'>
                  Khối lượng cơ sở (Base Unit)
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Giá trị dinh dưỡng sẽ được tính cho khối lượng này
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='baseUnit.amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs'>Số lượng</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.1'
                          min='0'
                          placeholder='100'
                          className='h-9'
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
                  name='baseUnit.unit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs'>Đơn vị</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='h-9'>
                            <SelectValue placeholder='Chọn đơn vị' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='g'>gram (g)</SelectItem>
                          <SelectItem value='ml'>milliliter (ml)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Serving Sizes */}
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-semibold mb-1'>
                  Đơn vị chuyển đổi
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Thêm các đơn vị đo lường khác nhau cho nguyên liệu này
                </p>
              </div>

              <div className='space-y-3'>
                {unitFields.map((field, index) => (
                  <div
                    key={field.id}
                    className='flex items-end gap-2 p-3 border rounded-lg bg-accent/5'
                  >
                    <FormField
                      control={form.control}
                      name={`units.${index}.value`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs'>Số lượng</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              placeholder='0'
                              className='h-9'
                              {...field}
                              value={field.value ?? ''}
                              onChange={e => {
                                const value = e.target.value;
                                field.onChange(
                                  value === '' ? '' : parseFloat(value) || ''
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`units.${index}.unit`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs'>Đơn vị</FormLabel>
                          <FormControl>
                            <Input
                              type='text'
                              placeholder='Ví dụ: cup, tbsp, whole'
                              className='h-9'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='text-xs text-muted-foreground pb-2 whitespace-nowrap'>
                      = {form.watch('baseUnit.amount') || 100}
                      {form.watch('baseUnit.unit') || 'g'}
                    </div>

                    {unitFields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-9 w-9 flex-shrink-0'
                        onClick={() => removeUnit(index)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddServingSize}
                className='w-full'
              >
                <Plus className='h-4 w-4 mr-2' />
                Thêm đơn vị chuyển đổi
              </Button>
            </div>

            <Separator />

            {/* Nutrition Values */}
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-semibold mb-1'>
                  Giá trị dinh dưỡng <span className='text-destructive'>*</span>
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Cho {form.watch('baseUnit.amount') || 100}
                  {form.watch('baseUnit.unit') || 'g'}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                {NUTRIENT_OPTIONS.map((nutrient, index) => (
                  <div key={nutrient.value} className='flex items-end gap-2'>
                    <FormField
                      control={form.control}
                      name={`nutrition.nutrients.${index}.value`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs flex items-center gap-1.5'>
                            {nutrient.value === 'Tinh bột' && (
                              <span className='inline-block w-2 h-2 rounded-full bg-yellow-500'></span>
                            )}
                            {nutrient.value === 'Chất béo' && (
                              <span className='inline-block w-2 h-2 rounded-full bg-cyan-500'></span>
                            )}
                            {nutrient.value === 'Protein' && (
                              <span className='inline-block w-2 h-2 rounded-full bg-purple-500'></span>
                            )}
                            {nutrient.label}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              placeholder='0'
                              className='h-9'
                              {...field}
                              value={field.value ?? ''}
                              onChange={e => {
                                const value = e.target.value;
                                field.onChange(
                                  value === '' ? '' : parseFloat(value) || ''
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                      {nutrient.unit}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional Nutrition */}
              <Collapsible
                open={isOptionalNutritionOpen}
                onOpenChange={setIsOptionalNutritionOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant='ghost'
                    className='w-full justify-between p-4 h-auto hover:bg-accent'
                    type='button'
                  >
                    <span className='text-sm font-medium'>
                      Giá trị dinh dưỡng tùy chọn
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOptionalNutritionOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className='space-y-6 pt-4'>
                  {/* Minerals */}
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>Khoáng chất</h4>

                    <div className='grid grid-cols-2 gap-4'>
                      {MINERAL_OPTIONS.map((mineral, index) => (
                        <div key={index} className='flex items-end gap-2'>
                          <FormField
                            control={form.control}
                            name={`nutrition.minerals.${index}.value`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
                                  {mineral.label}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    step='0.001'
                                    min='0'
                                    placeholder='0'
                                    className='h-9'
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e => {
                                      const value = e.target.value;
                                      field.onChange(
                                        value === ''
                                          ? ''
                                          : parseFloat(value) || ''
                                      );
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            mg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Vitamins */}
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>Vitamin</h4>

                    <div className='grid grid-cols-2 gap-4'>
                      {VITAMIN_OPTIONS.map((vitamin, index) => (
                        <div key={index} className='flex items-end gap-2'>
                          <FormField
                            control={form.control}
                            name={`nutrition.vitamins.${index}.value`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
                                  {vitamin.label}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    min='0'
                                    placeholder='0'
                                    className='h-9'
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e => {
                                      const value = e.target.value;
                                      field.onChange(
                                        value === ''
                                          ? ''
                                          : parseFloat(value) || ''
                                      );
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            μg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </form>
        </Form>

        {/* GIỮ NGUYÊN VỊ TRÍ DELETE BUTTON Ở CUỐI FORM */}
        <div className='flex justify-end gap-2 items-center mt-6 pt-6 border-t'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa nguyên liệu
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
