import { yupResolver } from '@hookform/resolvers/yup';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  X
} from 'lucide-react';
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
import { Separator } from '~/components/ui/separator';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/text-area';
import DeleteCollectionDialog from '~/features/collections/delete-collection/components/nutritionist/delete-collection-dialog';
import {
  useAddDishesToCollection,
  useRemoveDishesFromCollection
} from '~/features/collections/update-collection/api/manage-dishes';
import { useUpdateCollection } from '~/features/collections/update-collection/api/update-collection';
import { updateCollectionSchema } from '~/features/collections/update-collection/schemas/update-collection-schema';
import { useCollectionDetail } from '~/features/collections/view-collections-detail/api/view-collections-detail';
import { useDishes } from '~/features/dishes/view-dishes/api/view-dishes';

const CollectionDetail = ({ id }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dishSearch, setDishSearch] = useState('');
  const [openDishPopover, setOpenDishPopover] = useState(false);

  const { data: collection } = useCollectionDetail(id);

  // Fetch dishes list
  const { data: dishesData } = useDishes({
    page: 1,
    limit: 100,
    sort: 'name',
    filter: JSON.stringify({ isActive: true })
  });

  const { mutate: updateCollection, isPending: isUpdating } =
    useUpdateCollection({
      onSuccess: response => {
        toast.success(response.message || 'Cập nhật bộ sưu tập thành công');
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Cập nhật bộ sưu tập thất bại'
        );
      }
    });

  const { mutate: addDishes, isPending: isAddingDishes } =
    useAddDishesToCollection({
      onSuccess: response => {
        toast.success(response.message || 'Thêm món ăn thành công');
        setOpenDishPopover(false);
        setDishSearch('');
      },
      onError: error => {
        toast.error(error.response?.data?.message || 'Thêm món ăn thất bại');
      }
    });

  const { mutate: removeDishes, isPending: isRemovingDishes } =
    useRemoveDishesFromCollection({
      onSuccess: response => {
        toast.success(response.message || 'Xóa món ăn thành công');
      },
      onError: error => {
        toast.error(error.response?.data?.message || 'Xóa món ăn thất bại');
      }
    });

  const form = useForm({
    resolver: yupResolver(updateCollectionSchema),
    values: collection
      ? {
          name: collection.name || '',
          description: collection.description || '',
          tags: collection.tags || [],
          image: collection.image || '',
          isPublic: collection.isPublic?.toString() || 'false'
        }
      : undefined
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
      ...data,
      isPublic: data.isPublic === 'true' || data.isPublic === true
    };

    updateCollection({ id, data: processedData, image: selectedImage });
  };

  const handleTogglePublic = () => {
    const newPublicStatus = !collection.isPublic;
    updateCollection(
      {
        id,
        data: { isPublic: newPublicStatus },
        image: null
      },
      {
        onSuccess: () => {
          toast.success(
            newPublicStatus
              ? 'Bộ sưu tập đã được chuyển sang công khai'
              : 'Bộ sưu tập đã được chuyển sang riêng tư'
          );
        }
      }
    );
  };

  const handleBack = () => {
    navigate('/nutritionist/manage-collections');
  };

  const handleDeleteSuccess = () => {
    navigate('/nutritionist/manage-collections');
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
    addDishes({ id, dishIds: [dish._id] });
  };

  const handleRemoveDish = dishId => {
    removeDishes({ id, dishIds: [dishId] });
  };

  if (!collection) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-muted-foreground'>Không tìm thấy bộ sưu tập</p>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const displayImage =
    previewUrl || collection?.image || 'https://via.placeholder.com/128';

  const dishes = dishesData?.docs || [];
  const collectionDishIds = collection.dishes?.map(d => d.dishId) || [];
  const filteredDishes = dishes.filter(
    dish =>
      dish.name.toLowerCase().includes(dishSearch.toLowerCase()) &&
      !collectionDishIds.includes(dish._id)
  );

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
            alt={collection?.name}
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
            <h1 className='text-2xl font-bold'>{collection?.name}</h1>
            <Badge variant={collection?.isPublic ? 'default' : 'outline'}>
              {collection?.isPublic ? (
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

          {collection?.tags && collection.tags.length > 0 && (
            <div className='flex gap-1.5 flex-wrap justify-center md:justify-start mb-3'>
              {collection.tags.map((tag, idx) => (
                <Badge key={idx} variant='outline' className='text-xs'>
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className='flex gap-3 flex-wrap justify-center md:justify-start text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Users className='h-4 w-4' />
              <span>{collection?.user?.name || 'Unknown'}</span>
            </div>
            {collection?.dishes && collection.dishes.length > 0 && (
              <div className='flex items-center gap-1'>
                <Badge variant='secondary'>
                  {collection.dishes.length} món ăn
                </Badge>
              </div>
            )}
            {collection?.followers > 0 && (
              <div className='flex items-center gap-1'>
                <Heart className='h-4 w-4' />
                <span>{collection.followers} người theo dõi</span>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={collection?.isPublic ? 'outline' : 'default'}
            size='sm'
            onClick={handleTogglePublic}
            disabled={isUpdating}
          >
            {collection?.isPublic ? (
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
        <h2 className='text-lg font-semibold mb-6'>Thông tin bộ sưu tập</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên bộ sưu tập</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên bộ sưu tập' {...field} />
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
                        placeholder='Nhập mô tả bộ sưu tập'
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

            <Separator />

            {/* Dishes Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>
                  Món ăn ({collection.dishes?.length || 0})
                </h3>
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
                                {collectionDishIds.length === dishes.length
                                  ? 'Đã thêm tất cả món ăn'
                                  : 'Không có món ăn nào'}
                              </div>
                            ) : (
                              filteredDishes.map(dish => (
                                <CommandItem
                                  key={dish._id}
                                  value={dish.name}
                                  onSelect={() => handleAddDish(dish)}
                                  className='cursor-pointer'
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

              {!collection.dishes || collection.dishes.length === 0 ? (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-8 text-center'>
                    <p className='text-sm text-muted-foreground mb-4'>
                      Chưa có món ăn nào trong bộ sưu tập
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
                  {collection.dishes.map(dish => (
                    <Card key={dish.dishId}>
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
                            {dish.calories > 0 && (
                              <p className='text-xs text-muted-foreground mt-1'>
                                {dish.calories} cal
                              </p>
                            )}
                            {dish.addedAt && (
                              <p className='text-xs text-muted-foreground mt-1'>
                                Thêm vào:{' '}
                                {new Date(dish.addedAt).toLocaleDateString(
                                  'vi-VN'
                                )}
                              </p>
                            )}
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => handleRemoveDish(dish.dishId)}
                            disabled={isRemovingDishes}
                          >
                            <Trash2 className='h-4 w-4 text-destructive' />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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

        <div className='flex justify-start items-center mt-6 pt-6 border-t'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa bộ sưu tập
          </Button>
        </div>
      </div>

      <DeleteCollectionDialog
        collection={collection}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default CollectionDetail;
