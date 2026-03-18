import { ArrowLeft, Eye, EyeOff, Heart, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import DeleteCollectionDialog from '~/features/collections/delete-collection/components/nutritionist/delete-collection-dialog';
import { useCollectionDetail } from '~/features/collections/view-collections-detail/api/view-collections-detail';

import CollectionDetailSkeleton from './collection-detail-skeleton';

const CollectionDetail = ({ id }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: collection, isLoading } = useCollectionDetail(id);

  const handleBack = () => {
    navigate('/admin/manage-collections');
  };

  const handleDeleteSuccess = () => {
    navigate('/admin/manage-collections');
  };

  if (isLoading) {
    return <CollectionDetailSkeleton />;
  }

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

  const displayImage = collection?.image || 'https://via.placeholder.com/128';

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
        <h2 className='text-lg font-semibold'>Thông tin bộ sưu tập</h2>

        {/* Basic Information */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium mb-2'>Tên bộ sưu tập</h3>
            <p className='text-sm text-muted-foreground'>{collection.name}</p>
          </div>

          {collection?.description && (
            <div>
              <h3 className='text-sm font-medium mb-2'>Mô tả</h3>
              <p className='text-sm text-muted-foreground'>
                {collection.description}
              </p>
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Creator */}
            <div>
              <h3 className='text-sm font-medium mb-2'>Người tạo</h3>
              <p className='text-sm'>{collection.user?.name || '-'}</p>
            </div>

            {/* Created Date */}
            <div>
              <h3 className='text-sm font-medium mb-2'>Ngày tạo</h3>
              <p className='text-sm'>
                {collection.createdAt
                  ? new Date(collection.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dishes Section */}
        {collection?.dishes && collection.dishes.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>
              Món ăn ({collection.dishes.length})
            </h3>
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
                        <h4 className='font-medium truncate'>{dish.name}</h4>
                        {dish.description && (
                          <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                            {dish.description}
                          </p>
                        )}
                        {dish.energy > 0 && (
                          <div className='flex items-center gap-2 mt-2'>
                            <Badge variant='outline' className='text-xs'>
                              {dish.energy} kcal
                            </Badge>
                          </div>
                        )}
                        {dish.addedAt && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            Thêm vào:{' '}
                            {new Date(dish.addedAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!collection?.dishes || collection.dishes.length === 0) && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Món ăn (0)</h3>
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-8 text-center'>
                <p className='text-sm text-muted-foreground'>
                  Chưa có món ăn nào trong bộ sưu tập
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Separator />

        {/* Tags Section */}
        {collection?.tags && collection.tags.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Tags</h3>
            <div className='flex flex-wrap gap-2'>
              {collection.tags.map((tag, idx) => (
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
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Tổng món ăn</p>
              <p className='text-2xl font-bold'>
                {collection.dishes?.length || 0}
              </p>
            </div>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>
                Người theo dõi
              </p>
              <p className='text-2xl font-bold'>{collection.followers || 0}</p>
            </div>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Trạng thái</p>
              <Badge variant={collection.isPublic ? 'default' : 'secondary'}>
                {collection.isPublic ? 'Công khai' : 'Riêng tư'}
              </Badge>
            </div>
          </div>
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
