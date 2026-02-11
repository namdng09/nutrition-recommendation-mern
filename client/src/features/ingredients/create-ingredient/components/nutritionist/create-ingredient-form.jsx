import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, ChevronRight, Plus, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/text-area';
import { ALLERGEN_GROUPS, ALLERGEN_OPTIONS } from '~/constants/allergen';
import { useCreateIngredient } from '~/features/ingredients/create-ingredient/api/create-ingredient';
import {
  createIngredientSchema,
  INGREDIENT_CATEGORY_OPTIONS,
  MINERAL_OPTIONS,
  NUTRIENT_OPTIONS,
  VITAMIN_OPTIONS
} from '~/features/ingredients/create-ingredient/schemas/create-ingredient-schema';

const CreateIngredientForm = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOptionalNutritionOpen, setIsOptionalNutritionOpen] = useState(false);

  const form = useForm({
    resolver: yupResolver(createIngredientSchema),
    defaultValues: {
      name: '',
      description: '',
      categories: [],
      baseUnit: { amount: 100, unit: 'g' },
      units: [{ value: 100, unit: 'g', isDefault: false }],
      allergens: [],
      nutrition: {
        // Backend structure: nutrients là array, không phải object
        nutrients: NUTRIENT_OPTIONS.map(opt => ({
          label: opt.value,
          value: '',
          unit: opt.unit
        })),
        minerals: MINERAL_OPTIONS.map(opt => ({
          label: opt.value,
          value: '',
          unit: 'mg'
        })),
        vitamins: VITAMIN_OPTIONS.map(opt => ({
          label: opt.value,
          value: '',
          unit: 'μg'
        }))
      },
      isActive: true
    }
  });

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit
  } = useFieldArray({
    control: form.control,
    name: 'units'
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

  const handleAddAllergen = allergen => {
    const currentAllergens = form.getValues('allergens') || [];
    if (!currentAllergens.includes(allergen)) {
      form.setValue('allergens', [...currentAllergens, allergen], {
        shouldValidate: true
      });
    }
  };

  const handleRemoveAllergen = allergenToRemove => {
    const currentAllergens = form.getValues('allergens') || [];
    form.setValue(
      'allergens',
      currentAllergens.filter(a => a !== allergenToRemove),
      { shouldValidate: true }
    );
  };

  const handleAddServingSize = () => {
    appendUnit({ value: '', unit: '', isDefault: false });
  };

  const handleSetDefaultServing = index => {
    const units = form.getValues('units');
    const updatedUnits = units.map((unit, idx) => ({
      ...unit,
      isDefault: idx === index
    }));
    form.setValue('units', updatedUnits);
  };

  const onSubmit = data => {
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

    const cleanedData = {
      ...data,
      nutrition: {
        nutrients: removeEmptyValues(data.nutrition.nutrients || []),
        minerals: removeEmptyValues(data.nutrition.minerals || []),
        vitamins: removeEmptyValues(data.nutrition.vitamins || [])
      }
    };

    console.log('Submitting data:', cleanedData);
    createIngredient({ data: cleanedData, image: selectedImage });
  };

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
        <h2 className='text-lg font-semibold mb-6'>Tạo nguyên liệu mới</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Basic Information */}
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
                      <Input placeholder='Ví dụ: Chicken breast' {...field} />
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
                        placeholder='Ví dụ: raw, skinless'
                        className='resize-none'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormItem>
                <FormLabel>Hình ảnh</FormLabel>
                <div className='flex items-start gap-4'>
                  {previewUrl ? (
                    <div className='relative'>
                      <img
                        src={previewUrl}
                        alt='Preview'
                        className='h-24 w-24 object-cover rounded-lg border'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border'
                        onClick={handleRemoveImage}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </div>
                  ) : (
                    <label className='h-24 w-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors'>
                      <Upload className='h-6 w-6 text-muted-foreground mb-1' />
                      <span className='text-xs text-muted-foreground'>
                        Upload Image
                      </span>
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
            </div>

            <Separator />

            {/* Food Group & Allergens */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='categories'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>Nhóm nguyên liệu</FormLabel>
                    <div className='space-y-3'>
                      <Select onValueChange={handleAddCategory}>
                        <FormControl>
                          <SelectTrigger className='h-9'>
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
                                className='ml-1 hover:bg-destructive/20 rounded-sm p-0.5'
                                onClick={e => {
                                  e.preventDefault();
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
                name='allergens'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>Chất gây dị ứng</FormLabel>
                    <div className='space-y-3'>
                      <Select onValueChange={handleAddAllergen}>
                        <FormControl>
                          <SelectTrigger className='h-9'>
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
                                  className='ml-1 hover:bg-destructive/20 rounded-sm p-0.5'
                                  onClick={() => handleRemoveAllergen(allergen)}
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

            {/* Base Unit */}
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-semibold mb-1'>Khối lượng cơ sở</h3>
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
                      = {form.watch('baseUnit.amount')}
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

            {/* Nutritional Value */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>
                Giá trị dinh dưỡng <span className='text-destructive'>*</span>
              </h3>
              <p className='text-xs text-muted-foreground'>
                Cho {form.watch('baseUnit.amount')}{' '}
                {form.watch('baseUnit.unit')}
              </p>

              <div className='grid grid-cols-2 gap-4'>
                {NUTRIENT_OPTIONS.map((nutrient, index) => (
                  <div key={nutrient.value} className='flex items-end gap-2'>
                    <FormField
                      control={form.control}
                      name={`nutrition.nutrients.${index}.value`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs flex items-center gap-1.5'>
                            {/* Color indicators for macro nutrients */}
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

              {/* Optional Nutrition Values */}
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
                      {form
                        .watch('nutrition.minerals')
                        ?.map((mineral, index) => (
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
                                      placeholder=''
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
                      {form
                        .watch('nutrition.vitamins')
                        ?.map((vitamin, index) => (
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
                                      placeholder=''
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

            {/* Action Buttons */}
            <div className='flex justify-end gap-3 pt-6 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/nutritionist/manage-ingredients')}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Đang lưu...' : 'Tạo nguyên liệu'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateIngredientForm;
