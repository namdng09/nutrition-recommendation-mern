import { yupResolver } from '@hookform/resolvers/yup';
import {
  ArrowLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '~/components/ui/command';
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { ScrollArea } from '~/components/ui/scroll-area';
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
import { useCreateDish } from '~/features/dishes/create-dish/api/create-dish';
import {
  ALLERGEN_OPTIONS,
  createDishSchema,
  DISH_CATEGORY_OPTIONS,
  NUTRITION_FOCUS_OPTIONS
} from '~/features/dishes/create-dish/schemas/create-dish-schema';
import { NUTRITION_UNITS } from '~/features/dishes/create-dish/schemas/create-dish-schema';
import { useIngredients } from '~/features/ingredients/view-ingredients/api/view-ingredient';

const CreateDishForm = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [openIngredientPopover, setOpenIngredientPopover] = useState(false);

  // Fetch ingredients list
  const { data: ingredientsData, isLoading: isLoadingIngredients } =
    useIngredients({
      page: 1,
      limit: 100,
      sort: 'name',
      filter: JSON.stringify({ isActive: true })
    });

  const form = useForm({
    resolver: yupResolver(createDishSchema),
    defaultValues: {
      name: '',
      description: '',
      categories: [],
      nutritionFocus: [],
      ingredients: [],
      instructions: [{ step: 1, description: '' }],
      nutrition: {
        nutrients: [],
        minerals: [],
        vitamins: []
      },
      preparationTime: 0,
      cookTime: 0,
      servings: 1,
      tags: [],
      isActive: true,
      isPublic: false
    }
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient
  } = useFieldArray({
    control: form.control,
    name: 'ingredients'
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
    move: moveInstruction
  } = useFieldArray({
    control: form.control,
    name: 'instructions'
  });

  const { mutate: createDish, isPending } = useCreateDish({
    onSuccess: response => {
      form.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      toast.success(response.message || 'Tạo món ăn thành công');
      navigate('/nutritionist/manage-dishes');
    },
    onError: error => {
      console.error('Create dish error:', error);
      toast.error(error.response?.data?.message || 'Tạo món ăn thất bại');
    }
  });

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }

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

  const handleAddFocus = focus => {
    const currentFocus = form.getValues('nutritionFocus') || [];
    if (!currentFocus.includes(focus)) {
      form.setValue('nutritionFocus', [...currentFocus, focus], {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  };

  const handleRemoveFocus = focusToRemove => {
    const currentFocus = form.getValues('nutritionFocus') || [];
    form.setValue(
      'nutritionFocus',
      currentFocus.filter(f => f !== focusToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const selectedFocus = form.watch('nutritionFocus') || [];
  const availableFocus = NUTRITION_FOCUS_OPTIONS.filter(
    opt => !selectedFocus.includes(opt.value)
  );
  const handleAddCategory = category => {
    const currentCategories = form.getValues('categories') || [];
    if (!currentCategories.includes(category)) {
      form.setValue('categories', [...currentCategories, category], {
        shouldValidate: true,
        shouldDirty: true
      });
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

  const handleAddTag = () => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', [...currentTags, '']);
  };

  const handleRemoveTag = index => {
    const currentTags = form.getValues('tags') || [];
    form.setValue(
      'tags',
      currentTags.filter((_, idx) => idx !== index)
    );
  };

  const handleAddIngredient = ingredient => {
    const currentIngredients = form.getValues('ingredients') || [];

    const exists = currentIngredients.find(
      ing => ing.ingredientId === ingredient._id
    );

    if (exists) {
      toast.error('Nguyên liệu đã được thêm');
      return;
    }

    // Use ingredient's base unit as default

    const defaultUnit = ingredient.baseUnit || { amount: 100, unit: 'g' };

    appendIngredient({
      ingredientId: ingredient._id,
      name: ingredient.name,
      image: ingredient.image || '',
      description: ingredient.description || '',
      allergens: ingredient.allergens || [],
      units: [
        {
          quantity: defaultUnit.amount,
          unit: defaultUnit.unit,
          isDefault: true
        }
      ]
    });

    setOpenIngredientPopover(false);
    setIngredientSearch('');
  };

  const handleAddIngredientAllergen = (ingredientIndex, allergen) => {
    const currentAllergens =
      form.getValues(`ingredients.${ingredientIndex}.allergens`) || [];
    if (!currentAllergens.includes(allergen)) {
      form.setValue(`ingredients.${ingredientIndex}.allergens`, [
        ...currentAllergens,
        allergen
      ]);
    }
  };

  const handleRemoveIngredientAllergen = (
    ingredientIndex,
    allergenToRemove
  ) => {
    const currentAllergens =
      form.getValues(`ingredients.${ingredientIndex}.allergens`) || [];
    form.setValue(
      `ingredients.${ingredientIndex}.allergens`,
      currentAllergens.filter(a => a !== allergenToRemove)
    );
  };
  const handleAddIngredientUnit = ingredientIndex => {
    const currentUnits =
      form.getValues(`ingredients.${ingredientIndex}.units`) || [];
    form.setValue(`ingredients.${ingredientIndex}.units`, [
      ...currentUnits,
      { quantity: 100, unit: 'g', isDefault: false }
    ]);
  };

  const handleRemoveIngredientUnit = (ingredientIndex, unitIndex) => {
    const currentUnits =
      form.getValues(`ingredients.${ingredientIndex}.units`) || [];

    if (currentUnits.length === 1) {
      toast.error('Phải có ít nhất 1 đơn vị');
      return;
    }

    // If removing default unit, set another unit as default
    const removingDefault = currentUnits[unitIndex].isDefault;
    const newUnits = currentUnits.filter((_, idx) => idx !== unitIndex);

    if (removingDefault && newUnits.length > 0) {
      newUnits[0].isDefault = true;
    }

    form.setValue(`ingredients.${ingredientIndex}.units`, newUnits);
  };

  const handleSetDefaultUnit = (ingredientIndex, unitIndex) => {
    const units = form.getValues(`ingredients.${ingredientIndex}.units`);
    const updatedUnits = units.map((unit, idx) => ({
      ...unit,
      isDefault: idx === unitIndex
    }));
    form.setValue(`ingredients.${ingredientIndex}.units`, updatedUnits);
  };

  const handleAddInstruction = () => {
    const currentInstructions = form.getValues('instructions') || [];
    appendInstruction({
      step: currentInstructions.length + 1,
      description: ''
    });
  };

  const handleMoveInstruction = (index, direction) => {
    if (direction === 'up' && index > 0) {
      moveInstruction(index, index - 1);
    } else if (direction === 'down' && index < instructionFields.length - 1) {
      moveInstruction(index, index + 1);
    }

    // Update step numbers after moving
    setTimeout(() => {
      const instructions = form.getValues('instructions');
      instructions.forEach((_, idx) => {
        form.setValue(`instructions.${idx}.step`, idx + 1);
      });
    }, 0);
  };

  const handleRemoveInstruction = index => {
    if (instructionFields.length === 1) {
      toast.error('Phải có ít nhất 1 bước hướng dẫn');
      return;
    }

    removeInstruction(index);

    // Update step numbers after removal
    setTimeout(() => {
      const instructions = form.getValues('instructions');
      instructions.forEach((_, idx) => {
        form.setValue(`instructions.${idx}.step`, idx + 1);
      });
    }, 0);
  };

  const onSubmit = data => {
    console.log('=== FORM SUBMIT DEBUG ===');
    console.log('Raw form data:', data);

    // Validate at least one default unit per ingredient
    const hasInvalidIngredient = data.ingredients.some(
      ing => !ing.units.some(unit => unit.isDefault)
    );

    if (hasInvalidIngredient) {
      toast.error('Mỗi nguyên liệu phải có 1 đơn vị mặc định');
      return;
    }

    // Transform ingredients - remove extra fields that backend doesn't need
    const transformedIngredients = data.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      units: ing.units
    }));

    // Transform nutrition from object to array format
    let transformedNutrition = undefined;
    if (data.nutrition) {
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
        transformedNutrition = {
          nutrients: nutrients.length > 0 ? nutrients : undefined,
          minerals: minerals.length > 0 ? minerals : undefined,
          vitamins: vitamins.length > 0 ? vitamins : undefined
        };
      }
    }

    const transformedData = {
      ...data,
      ingredients: transformedIngredients,
      nutrition: transformedNutrition
    };

    console.log('Transformed data:', transformedData);
    createDish({ data: transformedData, image: selectedImage });
  };

  const selectedCategories = form.watch('categories') || [];
  const availableCategories = DISH_CATEGORY_OPTIONS.filter(
    cat => !selectedCategories.includes(cat.value)
  );

  const ingredients = ingredientsData?.docs || [];
  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate('/nutritionist/manage-dishes')}
        className='mb-4'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-6'>Tạo món ăn mới</h2>

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
                      Tên món ăn <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Cơm gà' {...field} />
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
                        placeholder='Mô tả món ăn...'
                        className='resize-none'
                        rows={3}
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
                        className='h-32 w-32 object-cover rounded-lg border'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-md'
                        onClick={handleRemoveImage}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </div>
                  ) : (
                    <label className='h-32 w-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors'>
                      <Upload className='h-8 w-8 text-muted-foreground mb-2' />
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
                <p className='text-xs text-muted-foreground mt-2'>
                  Định dạng: JPG, PNG. Tối đa 5MB
                </p>
              </FormItem>

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
                      <Select onValueChange={handleAddCategory} value=''>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn danh mục' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableCategories.length === 0 ? (
                            <div className='p-2 text-sm text-muted-foreground text-center'>
                              Đã chọn tất cả danh mục
                            </div>
                          ) : (
                            availableCategories.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))
                          )}
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
                                className='ml-1 hover:bg-destructive/20 rounded-sm p-0.5 transition-colors'
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

              {/* Nutrition Focus */}
              <FormField
                control={form.control}
                name='nutritionFocus'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mục tiêu dinh dưỡng{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <div className='space-y-3'>
                      <Select onValueChange={handleAddFocus} value=''>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn mục tiêu dinh dưỡng' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableFocus.length === 0 ? (
                            <div className='p-2 text-sm text-muted-foreground text-center'>
                              Đã chọn tất cả mục tiêu
                            </div>
                          ) : (
                            availableFocus.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>

                      {selectedFocus.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {selectedFocus.map((focus, idx) => (
                            <Badge
                              key={idx}
                              variant='secondary'
                              className='gap-1 pr-1'
                            >
                              {focus}
                              <button
                                type='button'
                                className='ml-1 hover:bg-destructive/20 rounded-sm p-0.5 transition-colors'
                                onClick={e => {
                                  e.preventDefault();
                                  handleRemoveFocus(focus);
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

              {/* Servings, Prep Time, Cook Time */}
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='servings'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số phần ăn</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='1'
                          placeholder='1'
                          {...field}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='preparationTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian chuẩn bị (phút)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='cookTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian nấu (phút)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          placeholder='0'
                          {...field}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Ingredients Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>
                  Nguyên liệu <span className='text-destructive'>*</span>
                </h3>
                <Popover
                  open={openIngredientPopover}
                  onOpenChange={setOpenIngredientPopover}
                >
                  <PopoverTrigger asChild>
                    <Button type='button' variant='outline' size='sm'>
                      <Plus className='h-4 w-4 mr-2' />
                      Thêm nguyên liệu
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[350px] p-0' align='end'>
                    <Command>
                      <CommandInput
                        placeholder='Tìm nguyên liệu...'
                        value={ingredientSearch}
                        onValueChange={setIngredientSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingIngredients ? (
                            <div className='flex items-center justify-center py-6'>
                              <Spinner className='h-6 w-6' />
                            </div>
                          ) : (
                            'Không tìm thấy nguyên liệu'
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className='h-[300px]'>
                            {filteredIngredients.map(ingredient => {
                              const isAdded = ingredientFields.some(
                                field => field.ingredientId === ingredient._id
                              );

                              return (
                                <CommandItem
                                  key={ingredient._id}
                                  disabled={isAdded}
                                  onSelect={() =>
                                    handleAddIngredient(ingredient)
                                  }
                                  className='cursor-pointer'
                                >
                                  <div className='flex items-center gap-3 w-full'>
                                    {ingredient.image && (
                                      <img
                                        src={ingredient.image}
                                        alt={ingredient.name}
                                        className='h-10 w-10 rounded object-cover border'
                                      />
                                    )}
                                    <div className='flex-1 min-w-0'>
                                      <p className='font-medium truncate'>
                                        {ingredient.name}
                                      </p>
                                      {ingredient.category && (
                                        <p className='text-xs text-muted-foreground'>
                                          {ingredient.category}
                                        </p>
                                      )}
                                    </div>
                                    {isAdded && (
                                      <Badge
                                        variant='secondary'
                                        className='text-xs'
                                      >
                                        Đã thêm
                                      </Badge>
                                    )}
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {ingredientFields.length === 0 ? (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-8 text-center'>
                    <p className='text-sm text-muted-foreground mb-4'>
                      Chưa có nguyên liệu nào được thêm
                    </p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setOpenIngredientPopover(true)}
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Thêm nguyên liệu
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className='space-y-3'>
                  {ingredientFields.map((field, ingredientIndex) => {
                    const ingredient = ingredients.find(
                      ing => ing._id === field.ingredientId
                    );
                    const units =
                      form.watch(`ingredients.${ingredientIndex}.units`) || [];
                    const allergens =
                      form.watch(`ingredients.${ingredientIndex}.allergens`) ||
                      [];

                    return (
                      <Card key={field.id}>
                        <CardContent className='p-4'>
                          <div className='space-y-4'>
                            {/* Ingredient Header */}
                            <div className='flex items-start gap-3'>
                              {ingredient?.image && (
                                <img
                                  src={ingredient.image}
                                  alt={ingredient.name}
                                  className='h-16 w-16 rounded object-cover border'
                                />
                              )}
                              <div className='flex-1'>
                                <div className='flex items-start justify-between'>
                                  <div>
                                    <h4 className='font-medium'>
                                      {ingredient?.name || field.name}
                                    </h4>
                                    {ingredient?.description && (
                                      <p className='text-xs text-muted-foreground mt-1'>
                                        {ingredient.description}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() =>
                                      removeIngredient(ingredientIndex)
                                    }
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Allergens */}
                            <div className='space-y-2'>
                              <label className='text-xs font-medium'>
                                Chất gây dị ứng
                              </label>
                              <div className='flex items-center gap-2'>
                                <Select
                                  onValueChange={allergen =>
                                    handleAddIngredientAllergen(
                                      ingredientIndex,
                                      allergen
                                    )
                                  }
                                  value=''
                                >
                                  <SelectTrigger className='h-8 text-xs'>
                                    <SelectValue placeholder='Thêm chất gây dị ứng' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ALLERGEN_OPTIONS.filter(
                                      opt => !allergens.includes(opt.value)
                                    ).map(option => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {allergens.length > 0 && (
                                <div className='flex flex-wrap gap-1'>
                                  {allergens.map((allergen, idx) => (
                                    <Badge
                                      key={idx}
                                      variant='secondary'
                                      className='text-xs gap-1 pr-1'
                                    >
                                      {allergen}
                                      <button
                                        type='button'
                                        onClick={() =>
                                          handleRemoveIngredientAllergen(
                                            ingredientIndex,
                                            allergen
                                          )
                                        }
                                        className='ml-1 hover:bg-destructive/20 rounded-sm p-0.5'
                                      >
                                        <X className='h-2 w-2' />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Units */}
                            <div className='space-y-2'>
                              <div className='flex items-center justify-between'>
                                <label className='text-xs font-medium'>
                                  Đơn vị{' '}
                                  <span className='text-destructive'>*</span>
                                </label>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  className='h-7 text-xs'
                                  onClick={() =>
                                    handleAddIngredientUnit(ingredientIndex)
                                  }
                                >
                                  <Plus className='h-3 w-3 mr-1' />
                                  Thêm đơn vị
                                </Button>
                              </div>

                              {units.map((unit, unitIndex) => (
                                <div
                                  key={unitIndex}
                                  className='flex items-center gap-2'
                                >
                                  <FormField
                                    control={form.control}
                                    name={`ingredients.${ingredientIndex}.units.${unitIndex}.quantity`}
                                    render={({ field }) => (
                                      <FormItem className='flex-1'>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            placeholder='Số lượng'
                                            className='h-8'
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
                                    name={`ingredients.${ingredientIndex}.units.${unitIndex}.unit`}
                                    render={({ field }) => (
                                      <FormItem className='flex-1'>
                                        <FormControl>
                                          <Input
                                            placeholder='Đơn vị (vd: g, ml, muỗng)'
                                            className='h-8'
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  <Button
                                    type='button'
                                    variant={
                                      unit.isDefault ? 'default' : 'outline'
                                    }
                                    size='sm'
                                    className='h-8 whitespace-nowrap px-3'
                                    onClick={() =>
                                      handleSetDefaultUnit(
                                        ingredientIndex,
                                        unitIndex
                                      )
                                    }
                                  >
                                    {unit.isDefault ? 'Mặc định' : 'Chọn'}
                                  </Button>

                                  {units.length > 1 && (
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='icon'
                                      className='h-8 w-8'
                                      onClick={() =>
                                        handleRemoveIngredientUnit(
                                          ingredientIndex,
                                          unitIndex
                                        )
                                      }
                                    >
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              {form.formState.errors.ingredients && (
                <p className='text-sm font-medium text-destructive'>
                  {form.formState.errors.ingredients.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Nutrition Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>
                Thông tin dinh dưỡng (tùy chọn)
              </h3>

              {/* Nutrients */}
              <Card>
                <CardHeader>
                  <h4 className='text-sm font-medium'>Chất dinh dưỡng</h4>
                </CardHeader>
                <CardContent className='grid grid-cols-2 gap-4'>
                  {[
                    'Năng lượng',
                    'Nước',
                    'Protein',
                    'Chất béo',
                    'Tinh bột',
                    'Chất xơ',
                    'Tro',
                    'Đường',
                    'Cholesterol',
                    'Phytosterol'
                  ].map(nutrient => (
                    <FormField
                      key={nutrient}
                      control={form.control}
                      name={`nutrition.nutrients.${nutrient}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>{nutrient}</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.01'
                              placeholder='0'
                              className='h-8'
                              {...field}
                              onChange={e =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Minerals */}
              <Card>
                <CardHeader>
                  <h4 className='text-sm font-medium'>Khoáng chất</h4>
                </CardHeader>
                <CardContent className='grid grid-cols-2 gap-4'>
                  {[
                    'Calci',
                    'Sắt',
                    'Magiê',
                    'Mangan',
                    'Phospho',
                    'Kali',
                    'Natri',
                    'Kẽm',
                    'Đồng',
                    'Selen'
                  ].map(mineral => (
                    <FormField
                      key={mineral}
                      control={form.control}
                      name={`nutrition.minerals.${mineral}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>{mineral}</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.01'
                              placeholder='0'
                              className='h-8'
                              {...field}
                              onChange={e =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Vitamins */}
              <Card>
                <CardHeader>
                  <h4 className='text-sm font-medium'>Vitamin</h4>
                </CardHeader>
                <CardContent className='grid grid-cols-2 gap-4'>
                  {[
                    'Vitamin C',
                    'Vitamin B1',
                    'Vitamin B2',
                    'Vitamin PP',
                    'Vitamin B5',
                    'Vitamin B6',
                    'Folat',
                    'Vitamin B9',
                    'Vitamin H',
                    'Vitamin B12',
                    'Vitamin A',
                    'Vitamin D',
                    'Vitamin E',
                    'Vitamin K'
                  ].map(vitamin => (
                    <FormField
                      key={vitamin}
                      control={form.control}
                      name={`nutrition.vitamins.${vitamin}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>{vitamin}</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.01'
                              placeholder='0'
                              className='h-8'
                              {...field}
                              onChange={e =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Instructions Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>
                  Hướng dẫn nấu <span className='text-destructive'>*</span>
                </h3>
              </div>

              <div className='space-y-3'>
                {instructionFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className='p-4'>
                      <div className='flex gap-3'>
                        <div className='flex flex-col items-center gap-1 pt-2'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={() => handleMoveInstruction(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronRight className='h-4 w-4 -rotate-90' />
                          </Button>
                          <GripVertical className='h-4 w-4 text-muted-foreground' />
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={() => handleMoveInstruction(index, 'down')}
                            disabled={index === instructionFields.length - 1}
                          >
                            <ChevronRight className='h-4 w-4 rotate-90' />
                          </Button>
                        </div>

                        <div className='flex-1 space-y-3'>
                          <FormField
                            control={form.control}
                            name={`instructions.${index}.step`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>
                                  Bước {field.value}
                                </FormLabel>
                                <FormControl>
                                  <input type='hidden' {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`instructions.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder='Nhập mô tả bước...'
                                    className='resize-none'
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {instructionFields.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 mt-6'
                            onClick={() => handleRemoveInstruction(index)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddInstruction}
                className='w-full'
              >
                <Plus className='h-4 w-4 mr-2' />
                Thêm bước
              </Button>
            </div>

            <Separator />

            {/* Tags Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Tags (tùy chọn)</h3>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddTag}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Thêm tag
                </Button>
              </div>

              {form.watch('tags')?.length > 0 && (
                <div className='space-y-2'>
                  {form.watch('tags').map((tag, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <FormField
                        control={form.control}
                        name={`tags.${index}`}
                        render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormControl>
                              <Input placeholder='Nhập tag...' {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => handleRemoveTag(index)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-3 pt-6 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/nutritionist/manage-dishes')}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className='h-4 w-4 mr-2' />
                    Đang lưu...
                  </>
                ) : (
                  'Tạo món ăn'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateDishForm;
