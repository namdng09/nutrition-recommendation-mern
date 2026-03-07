import {
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import DeletePostDialog from '~/features/post/delete-post/components/nutritionist/delete-post-dialog';
import { usePostDetail } from '~/features/post/view-post-detail/api/view-post-detail';
import { formatDate } from '~/lib/utils';

import PostDetailSkeleton from './post-detail-skeleton';

const PostDetail = ({ id }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: post, isLoading } = usePostDetail(id);

  const handleBack = () => {
    navigate('/admin/manage-posts');
  };

  const handleDeleteSuccess = () => {
    navigate('/admin/manage-posts');
  };

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

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

  const displayImage = post?.images?.[0] || 'https://via.placeholder.com/128';

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
            <h1 className='text-2xl font-bold'>{post?.title}</h1>
            <Badge variant={post?.isPublished ? 'default' : 'outline'}>
              {post?.isPublished ? (
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

          {post?.category && (
            <div className='flex gap-1.5 flex-wrap justify-center md:justify-start mb-3'>
              <Badge variant='secondary'>{post.category}</Badge>
            </div>
          )}

          {post?.tags && post.tags.length > 0 && (
            <div className='flex gap-1.5 flex-wrap justify-center md:justify-start mb-3'>
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant='outline' className='text-xs'>
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className='flex gap-3 flex-wrap justify-center md:justify-start text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Eye className='h-4 w-4' />
              <span>{post?.views || 0} lượt xem</span>
            </div>
            <div className='flex items-center gap-1'>
              <Heart className='h-4 w-4' />
              <span>{post?.likes?.length || 0} lượt thích</span>
            </div>
            <div className='flex items-center gap-1'>
              <MessageSquare className='h-4 w-4' />
              <span>{post?.comments?.length || 0} bình luận</span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='bg-card rounded-lg border p-6 space-y-6'>
        <h2 className='text-lg font-semibold'>Thông tin bài viết</h2>

        {/* Basic Information */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium mb-2'>Tiêu đề</h3>
            <p className='text-sm text-muted-foreground'>{post.title}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium mb-2'>Slug</h3>
            <p className='text-sm text-muted-foreground'>{post.slug}</p>
          </div>

          {post?.excerpt && (
            <div>
              <h3 className='text-sm font-medium mb-2'>Trích đoạn</h3>
              <p className='text-sm text-muted-foreground'>{post.excerpt}</p>
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Author */}
            <div>
              <h3 className='text-sm font-medium mb-2'>Tác giả</h3>
              <p className='text-sm'>{post.author?.name || '-'}</p>
            </div>

            {/* Category */}
            {post?.category && (
              <div>
                <h3 className='text-sm font-medium mb-2'>Danh mục</h3>
                <Badge variant='secondary'>{post.category}</Badge>
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <h3 className='text-sm font-medium mb-2'>Ngày tạo</h3>
              <p className='text-sm'>{formatDate(post.createdAt)}</p>
            </div>
            <div>
              <h3 className='text-sm font-medium mb-2'>Cập nhật lần cuối</h3>
              <p className='text-sm'>{formatDate(post.updatedAt)}</p>
            </div>
            {post?.publishedAt && (
              <div>
                <h3 className='text-sm font-medium mb-2'>Ngày xuất bản</h3>
                <p className='text-sm'>{formatDate(post.publishedAt)}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Content Section */}
        {post?.content && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Nội dung</h3>
            <div
              className='prose prose-sm max-w-none dark:prose-invert'
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        )}

        <Separator />

        {/* Images Section */}
        {post?.images && post.images.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>
              Hình ảnh ({post.images.length})
            </h3>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
              {post.images.map((image, idx) => (
                <Card key={idx}>
                  <CardContent className='p-2'>
                    <img
                      src={image}
                      alt={`Post image ${idx + 1}`}
                      className='w-full h-32 object-cover rounded'
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Tags Section */}
        {post?.tags && post.tags.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Tags</h3>
            <div className='flex flex-wrap gap-2'>
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant='outline'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <Separator />

        <div className='space-y-4'>
          <h3 className='text-sm font-semibold'>Thống kê</h3>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Lượt xem</p>
              <p className='text-2xl font-bold'>{post.views || 0}</p>
            </div>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Lượt thích</p>
              <p className='text-2xl font-bold'>{post.likes?.length || 0}</p>
            </div>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Bình luận</p>
              <p className='text-2xl font-bold'>{post.comments?.length || 0}</p>
            </div>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Trạng thái</p>
              <Badge variant={post.isPublished ? 'default' : 'secondary'}>
                {post.isPublished ? 'Công khai' : 'Riêng tư'}
              </Badge>
            </div>
          </div>
        </div>
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
