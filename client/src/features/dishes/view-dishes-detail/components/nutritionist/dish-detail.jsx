import { yupResolver } from '@hookform/resolvers/yup';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
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
import DeleteDishDialog from '~/features/dishes/delete-dish/components/nutritionist/delete-dish-dialog';
import { useUpdateDish } from '~/features/dishes/update-dish/api/update-dish';
import {
  DISH_CATEGORY_OPTIONS,
  updateDishSchema
} from '~/features/dishes/update-dish/schemas/update-dish-schema';
import { NUTRITION_FOCUS_OPTIONS } from '~/features/dishes/update-dish/schemas/update-dish-schema';
import {
  MINERALS_LIST,
  NUTRIENTS_LIST,
  NUTRITION_UNITS,
  VITAMINS_LIST
} from '~/features/dishes/update-dish/schemas/update-dish-schema';
import { useDishesDetail } from '~/features/dishes/view-dishes-detail/api/view-dishes-detail';
import { useIngredients } from '~/features/ingredients/view-ingredients/api/view-ingredient';
const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

const DishDetail = ({ id }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [openIngredientPopover, setOpenIngredientPopover] = useState(false);
  const [isOptionalNutritionOpen, setIsOptionalNutritionOpen] = useState(false);

  const { data: dish } = useDishesDetail(id);

  // Fetch ingredients list
  const { data: ingredientsData, isLoading: isLoadingIngredients } =
    useIngredients({
      page: 1,
      limit: 100,
      sort: 'name',
      filter: JSON.stringify({ isActive: true })
    });

  const { mutate: updateDish, isPending: isUpdating } = useUpdateDish({
    onSuccess: response => {
      toast.success(response.message || 'Cập nhật món ăn thành công');
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Cập nhật món ăn thất bại');
    }
  });

  const transformNutritionForForm = nutrition => {
    if (!nutrition) return { nutrients: {}, minerals: {}, vitamins: {} };

    const result = {
      nutrients: {},
      minerals: {},
      vitamins: {}
    };

    // Transform nutrients array to object
    if (nutrition.nutrients) {
      nutrition.nutrients.forEach(item => {
        result.nutrients[item.label] = item.value;
      });
    }

    // Transform minerals array to object
    if (nutrition.minerals) {
      nutrition.minerals.forEach(item => {
        result.minerals[item.label] = item.value;
      });
    }

    // Transform vitamins array to object
    if (nutrition.vitamins) {
      nutrition.vitamins.forEach(item => {
        result.vitamins[item.label] = item.value;
      });
    }

    return result;
  };

  const form = useForm({
    resolver: yupResolver(updateDishSchema),
    values: dish
      ? {
          name: dish.name || '',
          description: dish.description || '',
          categories: dish.categories || [],
          nutritionFocus: Array.isArray(dish.nutritionFocus)
            ? dish.nutritionFocus
            : [],
          ingredients:
            dish.ingredients?.map(ing => ({
              ingredientId: ing.ingredientId,
              name: ing.name || '',
              image: ing.image || '',
              description: ing.description || '',
              units: Array.isArray(ing.units) ? ing.units : []
            })) || [],
          instructions: Array.isArray(dish.instructions)
            ? dish.instructions
            : [],
          nutrition: transformNutritionForForm(dish.nutrition),
          preparationTime: dish.preparationTime || 0,
          cookTime: dish.cookTime || 0,
          servings: dish.servings || 1,
          tags: Array.isArray(dish.tags) ? dish.tags : [],
          image: dish.image || '',
          isActive: dish.isActive || false,
          isPublic: dish.isPublic || false
        }
      : undefined
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

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

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

  const handleSave = data => {
    const processedData = {
      name: data.name,
      description: data.description || '',
      categories: Array.isArray(data.categories) ? data.categories : [],
      nutritionFocus: Array.isArray(data.nutritionFocus)
        ? data.nutritionFocus
        : [],
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      instructions: Array.isArray(data.instructions) ? data.instructions : [],
      nutrition: data.nutrition,
      preparationTime: parseInt(data.preparationTime) || 0,
      cookTime: parseInt(data.cookTime) || 0,
      servings: parseInt(data.servings) || 1,
      tags: Array.isArray(data.tags) ? data.tags : [],
      isActive: data.isActive === true || data.isActive === 'true',
      isPublic: data.isPublic === true || data.isPublic === 'true'
    };

    updateDish({ id, data: processedData, image: selectedImage });
  };
  const handleToggleActive = () => {
    // GỬI TẤT CẢ FIELDS cần thiết để pass backend validation
    const currentFormData = form.getValues();

    updateDish({
      id,
      data: {
        name: currentFormData.name,
        description: currentFormData.description || '',
        categories: currentFormData.categories || [],
        nutritionFocus: currentFormData.nutritionFocus || [],
        ingredients: currentFormData.ingredients || [],
        instructions: currentFormData.instructions || [],
        preparationTime: currentFormData.preparationTime || 0,
        cookTime: currentFormData.cookTime || 0,
        servings: currentFormData.servings || 1,
        tags: currentFormData.tags || [],
        isActive: !dish.isActive, // TOGGLE THIS
        isPublic: dish.isPublic // Keep current value
      },
      image: selectedImage
    });
  };

  const handleTogglePublic = () => {
    const currentFormData = form.getValues();

    updateDish({
      id,
      data: {
        name: currentFormData.name,
        description: currentFormData.description || '',
        categories: currentFormData.categories || [],
        nutritionFocus: currentFormData.nutritionFocus || [],
        ingredients: currentFormData.ingredients || [],
        instructions: currentFormData.instructions || [],
        preparationTime: currentFormData.preparationTime || 0,
        cookTime: currentFormData.cookTime || 0,
        servings: currentFormData.servings || 1,
        tags: currentFormData.tags || [],
        isActive: dish.isActive, // Keep current value
        isPublic: !dish.isPublic // TOGGLE THIS
      },
      image: selectedImage
    });
  };

  const handleBack = () => {
    navigate('/nutritionist/manage-dishes');
  };

  const handleDeleteSuccess = () => {
    navigate('/nutritionist/manage-dishes');
  };

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

  const handleAddIngredient = ingredient => {
    const currentIngredients = form.getValues('ingredients') || [];

    const exists = currentIngredients.find(
      ing => ing.ingredientId === ingredient._id
    );

    if (exists) {
      toast.error('Nguyên liệu đã được thêm');
      return;
    }

    const defaultUnit = ingredient.baseUnit || { amount: 100, unit: 'g' };

    appendIngredient({
      ingredientId: ingredient._id,
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

  const handleAddIngredientUnit = ingredientIndex => {
    const currentUnits =
      form.getValues(`ingredients.${ingredientIndex}.units`) || [];
    form.setValue(`ingredients.${ingredientIndex}.units`, [
      ...currentUnits,
      { quantity: '', unit: '', isDefault: false }
    ]);
  };

  const handleRemoveIngredientUnit = (ingredientIndex, unitIndex) => {
    // Prevent removing the first (default) unit
    if (unitIndex === 0) {
      toast.error('Không thể xóa đơn vị mặc định');
      return;
    }

    const currentUnits =
      form.getValues(`ingredients.${ingredientIndex}.units`) || [];

    if (currentUnits.length === 1) {
      toast.error('Phải có ít nhất 1 đơn vị');
      return;
    }

    const newUnits = currentUnits.filter((_, idx) => idx !== unitIndex);
    form.setValue(`ingredients.${ingredientIndex}.units`, newUnits);
  };

  const selectedFocus = form.watch('nutritionFocus') || [];
  const availableFocus = NUTRITION_FOCUS_OPTIONS.filter(
    opt => !selectedFocus.includes(opt.value)
  );
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

    setTimeout(() => {
      const instructions = form.getValues('instructions');
      instructions.forEach((_, idx) => {
        form.setValue(`instructions.${idx}.step`, idx + 1);
      });
    }, 0);
  };

  if (!dish) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-muted-foreground'>Không tìm thấy món ăn</p>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const displayImage =
    previewUrl || dish?.image || 'https://via.placeholder.com/128';
  const selectedCategories = form.watch('categories') || [];
  const availableCategories = DISH_CATEGORY_OPTIONS.filter(
    cat => !selectedCategories.includes(cat.value)
  );

  const ingredients = ingredientsData?.docs || [];
  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  // Get full ingredient details for display
  const getIngredientDetails = ingredientId => {
    // First try to find in the ingredients list (has full data)
    const ingredientFromList = ingredients.find(
      ing => ing._id === ingredientId
    );

    if (ingredientFromList) {
      return ingredientFromList;
    }

    // Fallback to dish.ingredients (might have limited data)
    return (
      dish.ingredients?.find(ing => ing.ingredientId === ingredientId) || {
        name: 'Unknown',
        description: '',
        image: null
      }
    );
  };

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
            alt={dish?.name}
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
          {previewUrl && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-md'
              onClick={handleRemoveImage}
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>

        <div className='flex-1 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2 mb-2'>
            <h1 className='text-2xl font-bold'>{dish?.name}</h1>
            <Badge variant={dish?.isActive ? 'default' : 'secondary'}>
              {dish?.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant={dish?.isPublic ? 'default' : 'outline'}>
              {dish?.isPublic ? (
                <>
                  <Eye className='h-3 w-3 mr-1' />
                  Công khai
                </>
              ) : (
                <>
                  <EyeOff className='h-3 w-3 mr-1' />
                  Riêng tư
                </>
              )}
            </Badge>
          </div>

          {dish?.categories && dish.categories.length > 0 && (
            <div className='flex gap-1.5 flex-wrap justify-center md:justify-start mb-3'>
              {dish.categories.map((cat, idx) => (
                <Badge key={idx} variant='outline' className='text-xs'>
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          <div className='flex gap-3 flex-wrap justify-center md:justify-start text-sm text-muted-foreground'>
            {dish?.servings && (
              <div className='flex items-center gap-1'>
                <Users className='h-4 w-4' />
                <span>{dish.servings} phần</span>
              </div>
            )}
            {(dish?.preparationTime > 0 || dish?.cookTime > 0) && (
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                <span>
                  {(dish?.preparationTime || 0) + (dish?.cookTime || 0)} phút
                </span>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={dish?.isActive ? 'secondary' : 'default'}
            size='sm'
            onClick={handleToggleActive}
            disabled={isUpdating}
          >
            {dish?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
          <Button
            variant={dish?.isPublic ? 'outline' : 'default'}
            size='sm'
            onClick={handleTogglePublic}
            disabled={isUpdating}
          >
            {dish?.isPublic ? (
              <>
                <EyeOff className='h-4 w-4 mr-1' />
                Riêng tư
              </>
            ) : (
              <>
                <Eye className='h-4 w-4 mr-1' />
                Công khai
              </>
            )}
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

      {/* Edit Form */}
      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-6'>Thông tin món ăn</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên món ăn</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên món ăn' {...field} />
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
                        placeholder='Nhập mô tả món ăn'
                        className='resize-none'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Categories */}
                <FormField
                  control={form.control}
                  name='categories'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
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

                {/* Nutrition Focus */}
                <FormField
                  control={form.control}
                  name='nutritionFocus'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mục tiêu dinh dưỡng</FormLabel>
                      <div className='space-y-3'>
                        <Select onValueChange={handleAddFocus} value=''>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn mục tiêu' />
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
                                  className='ml-1 hover:bg-secondary-foreground/20 rounded-sm p-0.5'
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
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
              </div>

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
                <h3 className='text-sm font-semibold'>Nguyên liệu</h3>
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
                        <CommandEmpty>Không tìm thấy nguyên liệu</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className='h-[250px]'>
                            {isLoadingIngredients ? (
                              <div className='flex items-center justify-center py-6'>
                                <Spinner className='h-6 w-6' />
                              </div>
                            ) : filteredIngredients.length === 0 ? (
                              <div className='p-4 text-sm text-muted-foreground text-center'>
                                Không có nguyên liệu nào
                              </div>
                            ) : (
                              filteredIngredients.map(ingredient => (
                                <CommandItem
                                  key={ingredient._id}
                                  value={ingredient.name}
                                  onSelect={() =>
                                    handleAddIngredient(ingredient)
                                  }
                                  className='cursor-pointer'
                                >
                                  <div className='flex items-center gap-3 py-2'>
                                    {ingredient.image && (
                                      <img
                                        src={ingredient.image}
                                        alt={ingredient.name}
                                        className='h-10 w-10 rounded object-cover border'
                                      />
                                    )}
                                    <div className='flex-1'>
                                      <p className='font-medium'>
                                        {ingredient.name}
                                      </p>
                                      {ingredient.description && (
                                        <p className='text-xs text-muted-foreground line-clamp-1'>
                                          {ingredient.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))
                            )}
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
                    const ingredientDetails = getIngredientDetails(
                      field.ingredientId
                    );
                    const units =
                      form.watch(`ingredients.${ingredientIndex}.units`) || [];
                    const defaultUnitIndex = units.findIndex(u => u.isDefault);

                    return (
                      <Card key={field.id}>
                        <CardContent className='p-4'>
                          <div className='space-y-4'>
                            {/* Ingredient Header */}
                            <div className='flex items-start gap-3'>
                              {ingredientDetails?.image && (
                                <img
                                  src={ingredientDetails.image}
                                  alt={ingredientDetails.name}
                                  className='h-16 w-16 rounded object-cover border'
                                />
                              )}
                              <div className='flex-1'>
                                <div className='flex items-start justify-between'>
                                  <div>
                                    <h4 className='font-medium'>
                                      {ingredientDetails?.name || 'Unknown'}
                                    </h4>
                                    {ingredientDetails?.description && (
                                      <p className='text-xs text-muted-foreground mt-1'>
                                        {ingredientDetails.description}
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

                            {/* Units with Radio Selection */}
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

                              <RadioGroup
                                value={defaultUnitIndex.toString()}
                                onValueChange={value => {
                                  handleSetDefaultUnit(
                                    ingredientIndex,
                                    parseInt(value)
                                  );
                                }}
                              >
                                <div className='space-y-2'>
                                  {units.map((unit, unitIndex) => (
                                    <div
                                      key={unitIndex}
                                      className='flex items-center gap-2'
                                    >
                                      {/* Radio Button for Default Selection */}
                                      <div className='flex items-center'>
                                        <RadioGroupItem
                                          value={unitIndex.toString()}
                                          id={`ingredient-${ingredientIndex}-unit-${unitIndex}`}
                                          className='h-4 w-4'
                                        />
                                      </div>

                                      {/* Quantity Input */}
                                      <FormField
                                        control={form.control}
                                        name={`ingredients.${ingredientIndex}.units.${unitIndex}.quantity`}
                                        render={({ field }) => (
                                          <FormItem className='flex-1'>
                                            <FormControl>
                                              <Input
                                                type='number'
                                                step='0.01'
                                                min='0'
                                                placeholder='Số lượng'
                                                className='h-8'
                                                {...field}
                                                onChange={e =>
                                                  field.onChange(
                                                    parseFloat(
                                                      e.target.value
                                                    ) || ''
                                                  )
                                                }
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />

                                      {/* Unit Input - DISABLED for first unit only */}
                                      <FormField
                                        control={form.control}
                                        name={`ingredients.${ingredientIndex}.units.${unitIndex}.unit`}
                                        render={({ field }) => (
                                          <FormItem className='flex-1'>
                                            <FormControl>
                                              <Input
                                                placeholder='Đơn vị (vd: g, ml, muỗng)'
                                                className='h-8'
                                                disabled={unitIndex === 0}
                                                {...field}
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />

                                      {/* Label for Radio */}
                                      <label
                                        htmlFor={`ingredient-${ingredientIndex}-unit-${unitIndex}`}
                                        className='text-xs text-muted-foreground cursor-pointer whitespace-nowrap min-w-[60px] border px-2 py-1 rounded-md'
                                      >
                                        {unit.isDefault ? 'Mặc định' : 'Chọn'}
                                      </label>

                                      {/* Delete button - HIDDEN for first unit */}
                                      {unitIndex > 0 ? (
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
                                      ) : (
                                        <div className='h-8 w-8' />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Nutrition Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>Thông tin dinh dưỡng</h3>

              {/* Required Nutrients */}
              <div className='grid grid-cols-2 gap-4'>
                {[
                  { label: 'Năng lượng', unit: 'kcal', color: null },
                  { label: 'Nước', unit: 'g', color: null },
                  { label: 'Protein', unit: 'g', color: 'bg-purple-500' },
                  { label: 'Chất béo', unit: 'g', color: 'bg-cyan-500' },
                  { label: 'Tinh bột', unit: 'g', color: 'bg-yellow-500' },
                  { label: 'Chất xơ', unit: 'g', color: null }
                ].map(nutrient => (
                  <div key={nutrient.label} className='flex items-end gap-2'>
                    <FormField
                      control={form.control}
                      name={`nutrition.nutrients.${nutrient.label}`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs flex items-center gap-1.5'>
                            {nutrient.color && (
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${nutrient.color}`}
                              ></span>
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
                  {/* Additional Nutrients */}
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      {[
                        { label: 'Tro', unit: 'g' },
                        { label: 'Đường', unit: 'g' },
                        { label: 'Cholesterol', unit: 'mg' },
                        { label: 'Phytosterol', unit: 'mg' }
                      ].map(nutrient => (
                        <div
                          key={nutrient.label}
                          className='flex items-end gap-2'
                        >
                          <FormField
                            control={form.control}
                            name={`nutrition.nutrients.${nutrient.label}`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
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
                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            {nutrient.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Minerals */}
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>Khoáng chất</h4>
                    <div className='grid grid-cols-2 gap-4'>
                      {MINERALS_LIST.map(label => (
                        <div key={label} className='flex items-end gap-2'>
                          <FormField
                            control={form.control}
                            name={`nutrition.minerals.${label}`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
                                  {label}
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
                                        parseFloat(e.target.value) || undefined
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            {NUTRITION_UNITS[label]}
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
                      {VITAMINS_LIST.map(label => (
                        <div key={label} className='flex items-end gap-2'>
                          <FormField
                            control={form.control}
                            name={`nutrition.vitamins.${label}`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormLabel className='text-xs'>
                                  {label}
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
                                        parseFloat(e.target.value) || undefined
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className='w-16 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted h-9'>
                            {NUTRITION_UNITS[label]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Separator />

            {/* Instructions Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Hướng dẫn nấu</h3>
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
          </form>
        </Form>

        <div className='flex justify-end gap-2 items-center mt-6 pt-6 border-t'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa món ăn
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

      <DeleteDishDialog
        dish={dish}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default DishDetail;
