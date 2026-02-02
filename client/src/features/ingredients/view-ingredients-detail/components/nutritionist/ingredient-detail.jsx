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
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/text-area';
import DeleteIngredientDialog from '~/features/ingredients/delete-ingredient/components/nutritionist/delete-ingredient-dialog';
import { useUpdateIngredient } from '~/features/ingredients/update-ingredient/api/update-ingredient';
import {
  AMINO_ACID_OPTIONS,
  FAT_OPTIONS,
  FATTY_ACID_OPTIONS,
  INGREDIENT_CATEGORY_OPTIONS,
  MINERAL_OPTIONS,
  SUGAR_OPTIONS,
  UNIT_OPTIONS,
  updateIngredientSchema,
  VITAMIN_OPTIONS
} from '~/features/ingredients/update-ingredient/schemas/update-ingredient-schema';
import { useIngredientDetail } from '~/features/ingredients/view-ingredients-detail/api/view-ingredient-detail';

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
        toast.success(response.message || 'Cập nhật nguyên liệu thành công');
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Cập nhật nguyên liệu thất bại'
        );
      }
    });

  const form = useForm({
    resolver: yupResolver(updateIngredientSchema),
    values: ingredient
      ? {
          name: ingredient.name || '',
          description: ingredient.description || '',
          categories: ingredient.categories || [],
          baseUnit: ingredient.baseUnit || { amount: 100, unit: 'g' },
          units: ingredient.units || [
            { value: 100, unit: 'g', isDefault: true }
          ],
          allergens: ingredient.allergens || [],
          nutrition: {
            nutrients: {
              calories: ingredient.nutrition?.nutrients?.calories || {
                value: 0,
                unit: 'kcal'
              },
              carbs: ingredient.nutrition?.nutrients?.carbs || {
                value: 0,
                unit: 'g'
              },
              fat: ingredient.nutrition?.nutrients?.fat || {
                value: 0,
                unit: 'g'
              },
              protein: ingredient.nutrition?.nutrients?.protein || {
                value: 0,
                unit: 'g'
              },
              fiber: ingredient.nutrition?.nutrients?.fiber || {
                value: 0,
                unit: 'g'
              },
              sodium: ingredient.nutrition?.nutrients?.sodium || {
                value: 0,
                unit: 'mg'
              },
              cholesterol: ingredient.nutrition?.nutrients?.cholesterol || {
                value: 0,
                unit: 'mg'
              }
            },
            minerals: ingredient.nutrition?.minerals || [],
            vitamins: ingredient.nutrition?.vitamins || [],
            sugars: ingredient.nutrition?.sugars || [],
            fats: ingredient.nutrition?.fats || [],
            fattyAcids: ingredient.nutrition?.fattyAcids || [],
            aminoAcids: ingredient.nutrition?.aminoAcids || []
          },
          image: ingredient.image || '',
          isActive: ingredient.isActive?.toString() || 'true'
        }
      : undefined
  });

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit
  } = useFieldArray({
    control: form.control,
    name: 'units'
  });

  const {
    fields: mineralFields,
    append: appendMineral,
    remove: removeMineral
  } = useFieldArray({
    control: form.control,
    name: 'nutrition.minerals'
  });

  const {
    fields: vitaminFields,
    append: appendVitamin,
    remove: removeVitamin
  } = useFieldArray({
    control: form.control,
    name: 'nutrition.vitamins'
  });

  const {
    fields: aminoAcidFields,
    append: appendAminoAcid,
    remove: removeAminoAcid
  } = useFieldArray({
    control: form.control,
    name: 'nutrition.aminoAcids'
  });

  const {
    fields: sugarFields,
    append: appendSugar,
    remove: removeSugar
  } = useFieldArray({
    control: form.control,
    name: 'nutrition.sugars'
  });

  const {
    fields: fatFields,
    append: appendFat,
    remove: removeFat
  } = useFieldArray({
    control: form.control,
    name: 'nutrition.fats'
  });

  const {
    fields: fattyAcidFields,
    append: appendFattyAcid,
    remove: removeFattyAcid
  } = useFieldArray({
    control: form.control,
    name: 'nutrition.fattyAcids'
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
    form.setValue(
      'categories',
      currentCategories.filter(cat => cat !== categoryToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handleAddServingSize = () => {
    appendUnit({ value: 0, unit: 'whole', isDefault: false });
  };

  const handleSetDefaultServing = index => {
    const units = form.getValues('units');
    const updatedUnits = units.map((unit, idx) => ({
      ...unit,
      isDefault: idx === index
    }));
    form.setValue('units', updatedUnits);
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

  const macronutrients = [
    {
      name: 'Protein',
      value: nutrients?.protein?.value || 0,
      color: COLORS.protein
    },
    { name: 'Carbs', value: nutrients?.carbs?.value || 0, color: COLORS.carbs },
    { name: 'Fat', value: nutrients?.fat?.value || 0, color: COLORS.fat }
  ].filter(item => item.value > 0);

  const totalMacros = macronutrients.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Button variant='ghost' size='sm' onClick={handleBack} className='mb-4'>
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      {/* Profile Card */}
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
            {nutrients?.calories && (
              <Badge variant='outline'>
                {nutrients.calories.value} {nutrients.calories.unit}
              </Badge>
            )}
            {nutrients?.protein && (
              <Badge variant='outline' className='bg-purple-500/10'>
                Protein: {nutrients.protein.value}g
              </Badge>
            )}
            {nutrients?.carbs && (
              <Badge variant='outline' className='bg-yellow-500/10'>
                Carbs: {nutrients.carbs.value}g
              </Badge>
            )}
            {nutrients?.fat && (
              <Badge variant='outline' className='bg-cyan-500/10'>
                Fat: {nutrients.fat.value}g
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

      {/* Nutrition Chart */}
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
                    {nutrients?.calories?.value || 0}
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
                {nutrients?.fiber?.value > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Fiber</span>
                    <span className='font-medium'>
                      {nutrients.fiber.value}g
                    </span>
                  </div>
                )}
                {nutrients?.sodium?.value > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Sodium</span>
                    <span className='font-medium'>
                      {nutrients.sodium.value}mg
                    </span>
                  </div>
                )}
                {nutrients?.cholesterol?.value > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Cholesterol</span>
                    <span className='font-medium'>
                      {nutrients.cholesterol.value}mg
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
                  Nhập số lượng tương đương với khối lượng cơ sở. Ví dụ: 1 quả
                  trứng = 50g, để bằng 100g base cần 2 quả
                </p>
              </div>

              <FormLabel className='text-sm font-medium'>Mặc định</FormLabel>
              <RadioGroup
                value={unitFields
                  .findIndex(u =>
                    form.getValues(`units.${unitFields.indexOf(u)}.isDefault`)
                  )
                  .toString()}
                onValueChange={value =>
                  handleSetDefaultServing(parseInt(value))
                }
              >
                <div className='space-y-2'>
                  {unitFields.map((field, index) => (
                    <div
                      key={field.id}
                      className='flex items-center gap-2 p-3 border rounded-lg bg-accent/5'
                    >
                      <FormField
                        control={form.control}
                        name={`units.${index}.isDefault`}
                        render={({ field: radioField }) => (
                          <FormItem className='flex items-center space-y-0'>
                            <FormControl>
                              <RadioGroupItem
                                value={index.toString()}
                                checked={radioField.value}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className='flex-1 flex gap-2 items-end'>
                        <FormField
                          control={form.control}
                          name={`units.${index}.value`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel className='text-xs'>
                                Số lượng
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  min='0'
                                  placeholder='0'
                                  className='h-9'
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`units.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className='w-40'>
                              <FormLabel className='text-xs'>Đơn vị</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Chọn' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {UNIT_OPTIONS.map(option => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <div className='text-xs text-muted-foreground pb-2'>
                          = {form.watch('baseUnit.amount') || 100}
                          {form.watch('baseUnit.unit') || 'g'}
                        </div>
                      </div>

                      {unitFields.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() => removeUnit(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>

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
                <FormField
                  control={form.control}
                  name='nutrition.nutrients.calories.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs'>Calories</FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            min='0'
                            placeholder='0'
                            className='h-9'
                            {...field}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted'>
                          kcal
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.carbs.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-1.5 text-xs'>
                        <span className='inline-block w-2 h-2 rounded-full bg-yellow-500'></span>
                        Carbs
                      </FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            min='0'
                            placeholder='0'
                            className='h-9'
                            {...field}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted'>
                          g
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.fat.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-1.5 text-xs'>
                        <span className='inline-block w-2 h-2 rounded-full bg-cyan-500'></span>
                        Fats
                      </FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            min='0'
                            placeholder='0'
                            className='h-9'
                            {...field}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted'>
                          g
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='nutrition.nutrients.protein.value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-1.5 text-xs'>
                        <span className='inline-block w-2 h-2 rounded-full bg-purple-500'></span>
                        Protein
                      </FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            min='0'
                            placeholder='0'
                            className='h-9'
                            {...field}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted'>
                          g
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  {/* Fiber, Sodium, Cholesterol */}
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='nutrition.nutrients.fiber.value'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Fiber</FormLabel>
                          <div className='flex gap-2'>
                            <FormControl>
                              <Input
                                type='number'
                                step='0.1'
                                min='0'
                                placeholder='0'
                                className='h-9'
                                {...field}
                                onChange={e =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted'>
                              g
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='nutrition.nutrients.sodium.value'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Sodium</FormLabel>
                          <div className='flex gap-2'>
                            <FormControl>
                              <Input
                                type='number'
                                step='0.1'
                                min='0'
                                placeholder='0'
                                className='h-9'
                                {...field}
                                onChange={e =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted'>
                              mg
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='nutrition.nutrients.cholesterol.value'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Cholesterol</FormLabel>
                          <div className='flex gap-2'>
                            <FormControl>
                              <Input
                                type='number'
                                step='0.1'
                                min='0'
                                placeholder='0'
                                className='h-9'
                                {...field}
                                onChange={e =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted'>
                              mg
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Minerals */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>Khoáng chất</h4>
                      <Select
                        onValueChange={label =>
                          appendMineral({ label, value: 0, unit: 'mg' })
                        }
                      >
                        <SelectTrigger className='w-[200px] h-8'>
                          <SelectValue placeholder='Thêm khoáng chất' />
                        </SelectTrigger>
                        <SelectContent>
                          {MINERAL_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {mineralFields.map((field, index) => (
                      <div key={field.id} className='flex items-end gap-2'>
                        <FormField
                          control={form.control}
                          name={`nutrition.minerals.${index}.label`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel className='text-xs'>
                                {field.value}
                              </FormLabel>
                              <FormControl>
                                <input type='hidden' {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.minerals.${index}.value`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.001'
                                  min='0'
                                  placeholder='0'
                                  className='h-9'
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.minerals.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className='w-24'>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNIT_OPTIONS.map(option => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() => removeMineral(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Vitamins */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>Vitamin</h4>
                      <Select
                        onValueChange={label =>
                          appendVitamin({ label, value: 0, unit: 'μg' })
                        }
                      >
                        <SelectTrigger className='w-[200px] h-8'>
                          <SelectValue placeholder='Thêm vitamin' />
                        </SelectTrigger>
                        <SelectContent>
                          {VITAMIN_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {vitaminFields.map((field, index) => (
                      <div key={field.id} className='flex items-end gap-2'>
                        <FormField
                          control={form.control}
                          name={`nutrition.vitamins.${index}.label`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel className='text-xs'>
                                {field.value}
                              </FormLabel>
                              <FormControl>
                                <input type='hidden' {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.vitamins.${index}.value`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  min='0'
                                  placeholder='0'
                                  className='h-9'
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.vitamins.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className='w-24'>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNIT_OPTIONS.map(option => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() => removeVitamin(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Sugars */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>Đường (Sugars)</h4>
                      <Select
                        onValueChange={label =>
                          appendSugar({ label, value: 0, unit: 'g' })
                        }
                      >
                        <SelectTrigger className='w-[200px] h-8'>
                          <SelectValue placeholder='Thêm loại đường' />
                        </SelectTrigger>
                        <SelectContent>
                          {SUGAR_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {sugarFields.map((field, index) => (
                      <div key={field.id} className='flex items-end gap-2'>
                        <FormField
                          control={form.control}
                          name={`nutrition.sugars.${index}.label`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel className='text-xs'>
                                {field.value}
                              </FormLabel>
                              <FormControl>
                                <input type='hidden' {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.sugars.${index}.value`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.1'
                                  min='0'
                                  placeholder='0'
                                  className='h-9'
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.sugars.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className='w-24'>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNIT_OPTIONS.map(option => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() => removeSugar(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Fats */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>Chi tiết chất béo</h4>
                      <Select
                        onValueChange={label =>
                          appendFat({ label, value: 0, unit: 'g' })
                        }
                      >
                        <SelectTrigger className='w-[280px] h-8'>
                          <SelectValue placeholder='Thêm loại chất béo' />
                        </SelectTrigger>
                        <SelectContent>
                          {FAT_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {fatFields.map((field, index) => (
                      <div key={field.id} className='flex items-end gap-2'>
                        <FormField
                          control={form.control}
                          name={`nutrition.fats.${index}.label`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel className='text-xs'>
                                {field.value}
                              </FormLabel>
                              <FormControl>
                                <input type='hidden' {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.fats.${index}.value`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.1'
                                  min='0'
                                  placeholder='0'
                                  className='h-9'
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.fats.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className='w-24'>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNIT_OPTIONS.map(option => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() => removeFat(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Fatty Acids */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>Axit béo</h4>
                      <Select
                        onValueChange={label =>
                          appendFattyAcid({ label, value: 0, unit: 'g' })
                        }
                      >
                        <SelectTrigger className='w-[280px] h-8'>
                          <SelectValue placeholder='Thêm axit béo' />
                        </SelectTrigger>
                        <SelectContent>
                          {FATTY_ACID_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {fattyAcidFields.map((field, index) => (
                      <div key={field.id} className='flex items-end gap-2'>
                        <FormField
                          control={form.control}
                          name={`nutrition.fattyAcids.${index}.label`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel className='text-xs'>
                                {field.value}
                              </FormLabel>
                              <FormControl>
                                <input type='hidden' {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.fattyAcids.${index}.value`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.001'
                                  min='0'
                                  placeholder='0'
                                  className='h-9'
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.fattyAcids.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className='w-24'>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNIT_OPTIONS.map(option => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() => removeFattyAcid(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Amino Acids */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>Amino Acids</h4>
                      <Select
                        onValueChange={label =>
                          appendAminoAcid({ label, value: 0, unit: 'g' })
                        }
                      >
                        <SelectTrigger className='w-[200px] h-8'>
                          <SelectValue placeholder='Thêm amino acid' />
                        </SelectTrigger>
                        <SelectContent>
                          {AMINO_ACID_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {aminoAcidFields.map((field, index) => (
                      <div key={field.id} className='flex items-end gap-2'>
                        <FormField
                          control={form.control}
                          name={`nutrition.aminoAcids.${index}.label`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel className='text-xs'>
                                {field.value}
                              </FormLabel>
                              <FormControl>
                                <input type='hidden' {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.aminoAcids.${index}.value`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.001'
                                  min='0'
                                  placeholder='0'
                                  className='h-9'
                                  {...field}
                                  onChange={e =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`nutrition.aminoAcids.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className='w-24'>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNIT_OPTIONS.map(option => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() => removeAminoAcid(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
