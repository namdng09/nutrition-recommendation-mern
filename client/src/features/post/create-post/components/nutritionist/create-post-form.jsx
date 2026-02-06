import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

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
import { Separator } from '~/components/ui/separator';
import { Spinner } from '~/components/ui/spinner';
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';
import { POST_CATEGORY_OPTIONS } from '~/constants/post-category';
import { useCreatePost } from '~/features/post/create-post/api/create-post';
import { createPostSchema } from '~/features/post/create-post/schemas/create-post-schema';

const CreatePostForm = () => {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const form = useForm({
    resolver: yupResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: [],
      isPublished: false
    }
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag
  } = useFieldArray({
    control: form.control,
    name: 'tags'
  });

  const { mutate: createPost, isPending } = useCreatePost({
    onSuccess: () => {
      form.reset();
      setSelectedImages([]);
      setPreviewUrls([]);
      navigate('/nutritionist/manage-posts');
    }
  });

  const handleImagesChange = e => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (validFiles.length + selectedImages.length > 5) {
      alert('Tối đa 5 hình ảnh');
      return;
    }

    const newImages = [...selectedImages, ...validFiles];
    setSelectedImages(newImages);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const handleRemoveImage = index => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    URL.revokeObjectURL(previewUrls[index]);

    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleAddTag = () => {
    appendTag('');
  };

  const handleRemoveTag = index => {
    removeTag(index);
  };

  const onSubmit = data => {
    const filteredTags = data.tags.filter(tag => tag.trim());
    const submitData = {
      ...data,
      tags: filteredTags
    };

    createPost({ data: submitData, images: selectedImages });
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate('/nutritionist/manage-posts')}
        className='mb-4'
      >
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-6'>Tạo bài viết mới</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tiêu đề <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ví dụ: Bữa sáng dinh dưỡng'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nội dung <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập nội dung bài viết...'
                        className='resize-none min-h-[200px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Danh mục <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn danh mục' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {POST_CATEGORY_OPTIONS.map(option => (
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

              {/* Image Upload */}
              <FormItem>
                <FormLabel>Hình ảnh (tối đa 5)</FormLabel>
                <div className='space-y-3'>
                  {previewUrls.length > 0 && (
                    <div className='grid grid-cols-5 gap-3'>
                      {previewUrls.map((url, index) => (
                        <div key={index} className='relative'>
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className='h-24 w-full object-cover rounded-lg border'
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-md'
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedImages.length < 5 && (
                    <label className='h-24 w-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors'>
                      <Upload className='h-6 w-6 text-muted-foreground mb-1' />
                      <span className='text-xs text-muted-foreground'>
                        Thêm ảnh
                      </span>
                      <input
                        type='file'
                        accept='image/*'
                        multiple
                        className='hidden'
                        onChange={handleImagesChange}
                      />
                    </label>
                  )}
                </div>
                <p className='text-xs text-muted-foreground mt-2'>
                  Định dạng: JPG, PNG. Tối đa 5MB mỗi ảnh
                </p>
              </FormItem>
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

              {tagFields.length > 0 && (
                <div className='space-y-2'>
                  {tagFields.map((field, index) => (
                    <div key={field.id} className='flex items-center gap-2'>
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

            <Separator />

            {/* Publish Status */}
            <FormField
              control={form.control}
              name='isPublished'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      Đăng công khai ngay
                    </FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      Bài viết sẽ được hiển thị công khai
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className='flex justify-end gap-3 pt-6 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/nutritionist/manage-posts')}
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
                  'Tạo bài viết'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePostForm;
