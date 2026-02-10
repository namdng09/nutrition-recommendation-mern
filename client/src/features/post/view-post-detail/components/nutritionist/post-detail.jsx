import { yupResolver } from '@hookform/resolvers/yup';
import {
  ArrowLeft,
  Edit,
  Eye,
  Heart,
  MessageCircle,
  Plus,
  Save,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { Separator } from '~/components/ui/separator';
import { Spinner } from '~/components/ui/spinner';
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';
import { POST_CATEGORY_OPTIONS } from '~/constants/post-category';
import DeletePostDialog from '~/features/post/delete-post/components/nutritionist/delete-post-dialog';
import { useUpdatePost } from '~/features/post/update-post/api/update-post';
import { updatePostSchema } from '~/features/post/update-post/shemas/update-post-schema';
import { usePostDetail } from '~/features/post/view-post-detail/api/view-post-detail';
import { formatDate } from '~/lib/utils';

const PostDetail = ({ id }) => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const { data: post } = usePostDetail(id);

  const form = useForm({
    resolver: yupResolver(updatePostSchema),
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

  // Load existing post data
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title || '',
        content: post.content || '',
        category: post.category || '',
        tags: post.tags || [],
        isPublished: post.isPublished || false
      });

      if (post.images && post.images.length > 0) {
        setExistingImages(post.images);
      }
    }
  }, [post, form]);

  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost({
    onSuccess: response => {
      toast.success(response.message || 'Cập nhật bài viết thành công');
      setIsEditMode(false);
      setSelectedImages([]);
      setPreviewUrls([]);
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Cập nhật bài viết thất bại'
      );
    }
  });

  const handleBack = () => {
    navigate('/nutritionist/manage-posts');
  };

  const handleToggleEdit = () => {
    if (isEditMode) {
      // Reset form when canceling edit
      form.reset({
        title: post.title || '',
        content: post.content || '',
        category: post.category || '',
        tags: post.tags || [],
        isPublished: post.isPublished || false
      });
      setSelectedImages([]);
      setPreviewUrls([]);
      setExistingImages(post.images || []);
    }
    setIsEditMode(!isEditMode);
  };

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

    const totalImages =
      existingImages.length + selectedImages.length + validFiles.length;
    if (totalImages > 5) {
      toast.error('Tối đa 5 hình ảnh');
      return;
    }

    const newImages = [...selectedImages, ...validFiles];
    setSelectedImages(newImages);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const handleRemoveNewImage = index => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    URL.revokeObjectURL(previewUrls[index]);

    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleRemoveExistingImage = index => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  const handleAddTag = () => {
    appendTag('');
  };

  const handleRemoveTag = index => {
    removeTag(index);
  };

  const handleDeleteSuccess = () => {
    navigate('/nutritionist/manage-posts');
  };

  const onSubmit = data => {
    const filteredTags = data.tags.filter(tag => tag.trim());
    const submitData = {
      ...data,
      tags: filteredTags
    };

    const shouldUpdateImages =
      selectedImages.length > 0 ||
      existingImages.length !== (post?.images?.length || 0);

    updatePost({
      id,
      data: submitData,
      images: shouldUpdateImages ? selectedImages : undefined
    });
  };

  if (!post) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-muted-foreground'>Không tìm thấy bài viết</p>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const displayImage =
    post?.images?.[0] || 'https://via.placeholder.com/128?text=No+Image';

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
            alt={post?.title}
            className='h-32 w-32 object-cover rounded-lg'
          />
        </div>

        <div className='flex-1 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2 mb-2'>
            <h2 className='text-2xl font-bold'>{post?.title}</h2>
            <Badge variant={post?.isPublished ? 'default' : 'secondary'}>
              {post?.isPublished ? 'Đã xuất bản' : 'Nháp'}
            </Badge>
          </div>

          {post?.category && (
            <div className='flex gap-1.5 flex-wrap justify-center md:justify-start mb-3'>
              <Badge variant='outline'>{post.category}</Badge>
            </div>
          )}

          <div className='flex gap-2 flex-wrap justify-center md:justify-start text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Eye className='h-4 w-4' />
              <span>{post?.views || 0} lượt xem</span>
            </div>
            <div className='flex items-center gap-1'>
              <Heart className='h-4 w-4' />
              <span>{post?.likes?.length || 0} lượt thích</span>
            </div>
            <div className='flex items-center gap-1'>
              <MessageCircle className='h-4 w-4' />
              <span>{post?.comments?.length || 0} bình luận</span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={isEditMode ? 'outline' : 'default'}
            size='sm'
            onClick={handleToggleEdit}
          >
            {isEditMode ? (
              <>
                <X className='h-4 w-4 mr-1' />
                Hủy
              </>
            ) : (
              <>
                <Edit className='h-4 w-4 mr-1' />
                Sửa
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Images Gallery - View Mode */}
      {!isEditMode && post?.images && post.images.length > 0 && (
        <div className='bg-card rounded-lg border p-6 mb-6'>
          <h3 className='text-lg font-semibold mb-4'>Hình ảnh</h3>
          <div className='grid grid-cols-5 gap-3'>
            {post.images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Post image ${index + 1}`}
                className='h-24 w-full object-cover rounded-lg border'
              />
            ))}
          </div>
        </div>
      )}

      {/* Post Information */}
      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-6'>Thông tin bài viết</h2>

        {!isEditMode ? (
          // View Mode
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Tiêu đề
              </label>
              <p className='mt-1 text-base'>{post?.title}</p>
            </div>

            <Separator />

            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Nội dung
              </label>
              <p className='mt-1 text-base whitespace-pre-wrap'>
                {post?.content}
              </p>
            </div>

            <Separator />

            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Danh mục
              </label>
              <p className='mt-1'>
                {post?.category ? (
                  <Badge variant='secondary'>{post.category}</Badge>
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )}
              </p>
            </div>

            <Separator />

            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Slug
              </label>
              <p className='mt-1 text-sm text-muted-foreground'>{post?.slug}</p>
            </div>

            <Separator />

            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Tags
              </label>
              <div className='mt-2 flex gap-2 flex-wrap'>
                {post?.tags && post.tags.length > 0 ? (
                  post.tags.map((tag, idx) => (
                    <Badge key={idx} variant='outline'>
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className='text-sm text-muted-foreground'>
                    Không có tag
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Tác giả
              </label>
              <p className='mt-1'>{post?.author?.name || 'Không rõ'}</p>
            </div>

            <Separator />

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Ngày tạo
                </label>
                <p className='mt-1 text-sm'>{formatDate(post?.createdAt)}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Cập nhật lần cuối
                </label>
                <p className='mt-1 text-sm'>{formatDate(post?.updatedAt)}</p>
              </div>
            </div>

            <Separator />

            <div className='flex justify-end'>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className='h-4 w-4 mr-1' />
                Xóa bài viết
              </Button>
            </div>
          </div>
        ) : (
          // Edit Mode
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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

                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Danh mục <span className='text-destructive'>*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                    {existingImages.length > 0 && (
                      <div>
                        <p className='text-xs text-muted-foreground mb-2'>
                          Hình ảnh hiện tại
                        </p>
                        <div className='grid grid-cols-5 gap-3'>
                          {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} className='relative'>
                              <img
                                src={url}
                                alt={`Existing ${index + 1}`}
                                className='h-24 w-full object-cover rounded-lg border'
                              />
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-md'
                                onClick={() => handleRemoveExistingImage(index)}
                              >
                                <X className='h-3 w-3' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewUrls.length > 0 && (
                      <div>
                        <p className='text-xs text-muted-foreground mb-2'>
                          Hình ảnh mới
                        </p>
                        <div className='grid grid-cols-5 gap-3'>
                          {previewUrls.map((url, index) => (
                            <div key={`new-${index}`} className='relative'>
                              <img
                                src={url}
                                alt={`New ${index + 1}`}
                                className='h-24 w-full object-cover rounded-lg border'
                              />
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-md'
                                onClick={() => handleRemoveNewImage(index)}
                              >
                                <X className='h-3 w-3' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {existingImages.length + selectedImages.length < 5 && (
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
                  onClick={handleToggleEdit}
                >
                  Hủy
                </Button>
                <Button type='submit' disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Spinner className='h-4 w-4 mr-2' />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4 mr-1' />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>

      <DeletePostDialog
        post={post}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default PostDetail;
