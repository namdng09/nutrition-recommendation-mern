import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Eye, EyeOff, Plus, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
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
import { ScrollArea } from '~/components/ui/scroll-area';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/text-area';
import { useCreateCollection } from '~/features/collections/create-collection/api/create-collection';
import { createCollectionSchema } from '~/features/collections/create-collection/schemas/create-collection-schema';
import { useDishes } from '~/features/dishes/view-dishes/api/view-dishes';

const CreateCollectionForm = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dishSearch, setDishSearch] = useState('');
  const [openDishPopover, setOpenDishPopover] = useState(false);

  // Fetch dishes list
  const { data: dishesData } = useDishes({
    page: 1,
    limit: 100,
    sort: 'name',
    filter: JSON.stringify({ isActive: true })
  });

  const form = useForm({
    resolver: yupResolver(createCollectionSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
      tags: [],
      dishes: []
    }
  });

  const { mutate: createCollection, isPending } = useCreateCollection({
    onSuccess: response => {
      form.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      toast.success(response.message || 'Tạo bộ sưu tập thành công');
      navigate('/nutritionist/manage-collections');
    },
    onError: error => {
      console.error('Create collection error:', error);
      toast.error(error.response?.data?.message || 'Tạo bộ sưu tập thất bại');
    }
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

  const handleAddDish = dish => {
    const currentDishes = form.getValues('dishes') || [];

    if (currentDishes.includes(dish._id)) {
      toast.error('Món ăn đã được thêm');
      return;
    }

    form.setValue('dishes', [...currentDishes, dish._id]);
    setOpenDishPopover(false);
    setDishSearch('');
  };

  const handleRemoveDish = dishId => {
    const currentDishes = form.getValues('dishes') || [];
    form.setValue(
      'dishes',
      currentDishes.filter(id => id !== dishId)
    );
  };

  const onSubmit = data => {
    console.log('Submitting data:', data);
    createCollection({ data, image: selectedImage });
  };

  const dishes = dishesData?.docs || [];
  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(dishSearch.toLowerCase())
  );

  const selectedDishIds = form.watch('dishes') || [];
  const selectedDishes = dishes.filter(dish =>
    selectedDishIds.includes(dish._id)
  );

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate('/nutritionist/manage-collections')}
        className='mb-4'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-6'>Tạo bộ sưu tập mới</h2>

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
                      Tên bộ sưu tập <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ví dụ: Bộ sưu tập món nhanh'
                        {...field}
                      />
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
                        placeholder='Mô tả bộ sưu tập...'
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

              {/* Public/Private Toggle */}
              <FormField
                control={form.control}
                name='isPublic'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái hiển thị</FormLabel>
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Button
                          type='button'
                          variant={field.value ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => field.onChange(true)}
                        >
                          <Eye className='h-4 w-4 mr-2' />
                          Công khai
                        </Button>
                        <Button
                          type='button'
                          variant={!field.value ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => field.onChange(false)}
                        >
                          <EyeOff className='h-4 w-4 mr-2' />
                          Riêng tư
                        </Button>
                      </div>
                    </FormControl>
                    <p className='text-xs text-muted-foreground'>
                      {field.value
                        ? 'Bộ sưu tập sẽ hiển thị công khai cho mọi người'
                        : 'Bộ sưu tập chỉ hiển thị cho bạn'}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dishes Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Món ăn (tùy chọn)</h3>
                <Popover
                  open={openDishPopover}
                  onOpenChange={setOpenDishPopover}
                >
                  <PopoverTrigger asChild>
                    <Button type='button' variant='outline' size='sm'>
                      <Plus className='h-4 w-4 mr-2' />
                      Thêm món ăn
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[400px] p-0' align='end'>
                    <Command>
                      <CommandInput
                        placeholder='Tìm món ăn...'
                        value={dishSearch}
                        onValueChange={setDishSearch}
                      />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy món ăn</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className='h-[300px]'>
                            {filteredDishes.length === 0 ? (
                              <div className='p-4 text-sm text-muted-foreground text-center'>
                                Không có món ăn nào
                              </div>
                            ) : (
                              filteredDishes.map(dish => (
                                <CommandItem
                                  key={dish._id}
                                  value={dish.name}
                                  onSelect={() => handleAddDish(dish)}
                                  className='cursor-pointer'
                                  disabled={selectedDishIds.includes(dish._id)}
                                >
                                  <div className='flex items-center gap-3 py-2 w-full'>
                                    {dish.image && (
                                      <img
                                        src={dish.image}
                                        alt={dish.name}
                                        className='h-12 w-12 rounded object-cover border'
                                      />
                                    )}
                                    <div className='flex-1 min-w-0'>
                                      <p className='font-medium truncate'>
                                        {dish.name}
                                      </p>
                                      {dish.description && (
                                        <p className='text-xs text-muted-foreground line-clamp-1'>
                                          {dish.description}
                                        </p>
                                      )}
                                      {dish.categories &&
                                        dish.categories.length > 0 && (
                                          <div className='flex gap-1 mt-1'>
                                            {dish.categories
                                              .slice(0, 2)
                                              .map((cat, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant='outline'
                                                  className='text-xs'
                                                >
                                                  {cat}
                                                </Badge>
                                              ))}
                                          </div>
                                        )}
                                    </div>
                                    {selectedDishIds.includes(dish._id) && (
                                      <Badge variant='secondary'>Đã thêm</Badge>
                                    )}
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

              {selectedDishes.length === 0 ? (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-8 text-center'>
                    <p className='text-sm text-muted-foreground mb-4'>
                      Chưa có món ăn nào được thêm
                    </p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setOpenDishPopover(true)}
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Thêm món ăn
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {selectedDishes.map(dish => (
                    <Card key={dish._id}>
                      <CardContent className='p-4'>
                        <div className='flex items-start gap-3'>
                          {dish.image && (
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className='h-16 w-16 rounded object-cover border'
                            />
                          )}
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-medium truncate'>
                              {dish.name}
                            </h4>
                            {dish.description && (
                              <p className='text-xs text-muted-foreground line-clamp-2 mt-1'>
                                {dish.description}
                              </p>
                            )}
                            {dish.categories && dish.categories.length > 0 && (
                              <div className='flex gap-1 mt-2 flex-wrap'>
                                {dish.categories.slice(0, 2).map((cat, idx) => (
                                  <Badge
                                    key={idx}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {cat}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => handleRemoveDish(dish._id)}
                          >
                            <Trash2 className='h-4 w-4 text-destructive' />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <p className='text-xs text-muted-foreground'>
                Đã chọn {selectedDishes.length} món ăn
              </p>
            </div>

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

            {/* Submit Buttons */}
            <div className='flex justify-end gap-3 pt-6 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/nutritionist/manage-collections')}
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
                  'Tạo bộ sưu tập'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateCollectionForm;
