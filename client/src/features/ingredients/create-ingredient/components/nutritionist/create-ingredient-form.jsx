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
import { useCreateIngredient } from '~/features/ingredients/create-ingredient/api/create-ingredient';
import {
  AMINO_ACID_OPTIONS,
  createIngredientSchema,
  FAT_OPTIONS,
  FATTY_ACID_OPTIONS,
  INGREDIENT_CATEGORY_OPTIONS,
  MINERAL_OPTIONS,
  SUGAR_OPTIONS,
  UNIT_OPTIONS,
  VITAMIN_OPTIONS
} from '~/features/ingredients/create-ingredient/schemas/create-ingredient-schema';
import { ALLERGEN_GROUPS, ALLERGEN_OPTIONS } from '~/constants/allergen';

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
      baseUnit: { amount: 100, unit: 'g' }, // Base là 100g
      units: [{ value: 100, unit: 'g', isDefault: true }],
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
        },
        minerals: [
          { label: 'Alpha carotene', value: 0, unit: 'μg' },
          { label: 'Beta carotene', value: 0, unit: 'μg' },
          { label: 'Caffeine', value: 0, unit: 'mg' },
       
          { label: 'Choline', value: 0, unit: 'mg' },
          { label: 'Copper', value: 0, unit: 'mg' },
          { label: 'Fluoride', value: 0, unit: 'μg' },
          { label: 'Folate (B9)', value: 0, unit: 'μg' },
  
          { label: 'Lycopene', value: 0, unit: 'μg' },
          { label: 'Magnesium', value: 0, unit: 'mg' },
          { label: 'Manganese', value: 0, unit: 'mg' },
          { label: 'Niacin', value: 0, unit: 'mg' },
          { label: 'Pantothenic acid', value: 0, unit: 'mg' },
          { label: 'Phosphorus', value: 0, unit: 'mg' },
  
          { label: 'Retinol', value: 0, unit: 'μg' },
          { label: 'Riboflavin (B2)', value: 0, unit: 'mg' },
          { label: 'Selenium', value: 0, unit: 'μg' },
          { label: 'Theobromine', value: 0, unit: 'mg' },
          { label: 'Thiamine', value: 0, unit: 'mg' },
          { label: 'Zinc', value: 0, unit: 'mg' }
        ],
        vitamins: [
          { label: 'Vitamin A', value: 0, unit: 'μg' },
          { label: 'Vitamin A IU', value: 0, unit: 'IU' },
          { label: 'Vitamin B6', value: 0, unit: 'mg' },
          { label: 'Vitamin B12', value: 0, unit: 'μg' },
          { label: 'Vitamin C', value: 0, unit: 'mg' },
          { label: 'Vitamin D IU', value: 0, unit: 'IU' },
          { label: 'Vitamin D2', value: 0, unit: 'μg' },
          { label: 'Vitamin D3', value: 0, unit: 'μg' },
          { label: 'Vitamin E', value: 0, unit: 'mg' },
          { label: 'Vitamin K', value: 0, unit: 'μg' }
        ],
        sugars: [
          { label: 'Sugar', value: 0, unit: 'g' },
          { label: 'Sucrose', value: 0, unit: 'g' },
          { label: 'Glucose', value: 0, unit: 'g' },
          { label: 'Fructose', value: 0, unit: 'g' },
          { label: 'Lactose', value: 0, unit: 'g' },
          { label: 'Maltose', value: 0, unit: 'g' },
          { label: 'Galactose', value: 0, unit: 'g' },
          { label: 'Starch', value: 0, unit: 'g' }
        ],
        fats: [
          { label: 'Saturated fats', value: 0, unit: 'g' },
          { label: 'Monounsaturated fats', value: 0, unit: 'g' },
          { label: 'Polyunsaturated fats', value: 0, unit: 'g' },
          { label: 'Trans fats', value: 0, unit: 'g' }
        ],
        fattyAcids: [
          { label: 'Total omega 3', value: 0, unit: 'g' },
          { label: 'Total omega 6', value: 0, unit: 'g' },
          { label: 'Alpha Linolenic Acid (ALA)', value: 0, unit: 'g' },
          { label: 'Docosahexaenoic Acid (DHA)', value: 0, unit: 'g' },
          { label: 'Eicosapentaenoic Acid (EPA)', value: 0, unit: 'g' },
          { label: 'Docosapentaenoic Acid (DPA)', value: 0, unit: 'g' }
        ],
        aminoAcids: [
          { label: 'Alanine', value: 0, unit: 'g' },
          { label: 'Arginine', value: 0, unit: 'g' },
          { label: 'Aspartic acid', value: 0, unit: 'g' },
          { label: 'Cystine', value: 0, unit: 'g' },
          { label: 'Glutamic acid', value: 0, unit: 'g' },
          { label: 'Glycine', value: 0, unit: 'g' },
          { label: 'Histidine', value: 0, unit: 'g' },
          { label: 'Hydroxyproline', value: 0, unit: 'g' },
          { label: 'Isoleucine', value: 0, unit: 'g' },
          { label: 'Leucine', value: 0, unit: 'g' },
          { label: 'Lysine', value: 0, unit: 'g' },
          { label: 'Methionine', value: 0, unit: 'g' },
          { label: 'Phenylalanine', value: 0, unit: 'g' },
          { label: 'Proline', value: 0, unit: 'g' },
          { label: 'Serine', value: 0, unit: 'g' },
          { label: 'Threonine', value: 0, unit: 'g' },
          { label: 'Tryptophan', value: 0, unit: 'g' },
          { label: 'Tyrosine', value: 0, unit: 'g' },
          { label: 'Valine', value: 0, unit: 'g' }
        ]
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

  const onSubmit = data => {
  // Hàm helper để loại bỏ các trường rỗng
  const removeEmptyValues = (arr) => {
    return arr
      .map(item => ({
        ...item,
        value: item.value || item.value === 0 ? item.value : undefined
      }))
      .filter(item => item.value !== undefined && item.value !== '' && item.value !== 0);
  };

  const cleanedData = {
    ...data,
    nutrition: {
      nutrients: data.nutrition.nutrients,
      minerals: removeEmptyValues(data.nutrition.minerals),
      vitamins: removeEmptyValues(data.nutrition.vitamins),
      sugars: removeEmptyValues(data.nutrition.sugars),
      fats: removeEmptyValues(data.nutrition.fats),
      fattyAcids: removeEmptyValues(data.nutrition.fattyAcids),
      aminoAcids: removeEmptyValues(data.nutrition.aminoAcids)
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

            {/* Food Group & Allergens - Cùng 1 dòng */}
            <div className='grid grid-cols-2 gap-4'>
              {/* Food Group */}
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

              {/* Allergens */}
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

            {/* Base Unit - Khối lượng cơ sở */}
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

            {/* Serving Sizes - Các đơn vị chuyển đổi */}
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-semibold mb-1'>
                  Đơn vị chuyển đổi
                </h3>
                {/* <p className='text-xs text-muted-foreground'>
                  Nhập số lượng tương đương với khối lượng cơ sở. Ví dụ: 1 quả
                  trứng = 50g, để bằng 100g base cần 2 quả
                </p> */}
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
                          = {form.watch('baseUnit.amount')}
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

            {/* Nutritional Value */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>
                Giá trị dinh dưỡng <span className='text-destructive'>*</span>
              </h3>

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


                {/* Thêm Fiber, Sodium, Cholesterol */}
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
                              field.onChange(parseFloat(e.target.value) || 0)
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
                              field.onChange(parseFloat(e.target.value) || 0)
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
                      {form.watch('nutrition.minerals')?.map((mineral, index) => (
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

                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            {mineral.unit}
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
                      {form.watch('nutrition.vitamins')?.map((vitamin, index) => (
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

                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            {vitamin.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Sugar */}
                   <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>Đường (Sugars)</h4>

                    <div className='grid grid-cols-2 gap-4'>
                      {form.watch('nutrition.sugars')?.map((sugar, index) => (
                        <div key={index} className='flex items-end gap-2'>
                          <FormField
                            control={form.control}
                            name={`nutrition.sugars.${index}.value`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
                                  {sugar.label}
                                </FormLabel>
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

                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            g
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Fats */}
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>Chi tiết chất béo</h4>

                    <div className='grid grid-cols-2 gap-4'>
                      {form.watch('nutrition.fats')?.map((fat, index) => (
                        <div key={index} className='flex items-end gap-2'>
                          <FormField
                            control={form.control}
                            name={`nutrition.fats.${index}.value`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
                                  {fat.label}
                                </FormLabel>
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

                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            g
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Fatty Acids */}
                   <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>Axit béo</h4>

                    <div className='grid grid-cols-2 gap-4'>
                      {form.watch('nutrition.fattyAcids')?.map((fattyAcid, index) => (
                        <div key={index} className='flex items-end gap-2'>
                          <FormField
                            control={form.control}
                            name={`nutrition.fattyAcids.${index}.value`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
                                  {fattyAcid.label}
                                </FormLabel>
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

                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            g
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Amino Acids */}
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>Amino Acids</h4>

                    <div className='grid grid-cols-2 gap-4'>
                      {form.watch('nutrition.aminoAcids')?.map((aminoAcid, index) => (
                        <div key={index} className='flex items-end gap-2'>
                          <FormField
                            control={form.control}
                            name={`nutrition.aminoAcids.${index}.value`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
                                  {aminoAcid.label}
                                </FormLabel>
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

                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            g
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
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Đang lưu...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateIngredientForm;
