import { Eye, Heart, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import DeleteBulkCollectionsDialog from '~/features/collections/delete-collection/components/nutritionist/delete-bulk-collections-dialog';
import DeleteCollectionDialog from '~/features/collections/delete-collection/components/nutritionist/delete-collection-dialog';
import { useCollections } from '~/features/collections/view-collections/api/view-collection';

const CollectionsTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt',
    name: searchParams.get('name') || undefined
  };

  const { data } = useCollections(params);

  const handleDelete = collection => {
    setCollectionToDelete(collection);
    setDeleteDialogOpen(true);
  };

  const handleBulkAction = selectedCollections => {
    setSelectedCollectionIds(
      selectedCollections.map(collection => collection._id)
    );
    setBulkDeleteDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: 'image',
      header: 'Hình ảnh',
      cell: ({ row }) => (
        <img
          src={row.original.image || 'https://via.placeholder.com/40'}
          alt={row.original.name}
          className='h-10 w-10 object-cover rounded'
        />
      ),
      enableSorting: false
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tên bộ sưu tập' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col gap-1'>
          <span className='font-medium'>{row.original.name}</span>
          {row.original.description && (
            <span className='text-xs text-muted-foreground line-clamp-1'>
              {row.original.description}
            </span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'user.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Người tạo' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Users className='h-4 w-4 text-muted-foreground' />
          <span>{row.original.user?.name || '-'}</span>
        </div>
      )
    },
    {
      accessorKey: 'dishCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Số món ăn' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <Badge variant='secondary'>
            {row.original.dishes?.length || 0} món
          </Badge>
        </div>
      )
    },
    {
      accessorKey: 'followers',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Người theo dõi' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <Heart className='h-4 w-4 text-muted-foreground' />
          <span>{row.original.followers || 0}</span>
        </div>
      )
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <div className='flex gap-1 flex-wrap max-w-[200px]'>
          {row.original.tags?.length > 0 ? (
            row.original.tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} variant='outline' className='text-xs'>
                {tag}
              </Badge>
            ))
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          )}
          {row.original.tags?.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{row.original.tags.length - 2}
            </Badge>
          )}
        </div>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'isPublic',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge variant={row.original.isPublic ? 'default' : 'secondary'}>
          {row.original.isPublic ? 'Công khai' : 'Riêng tư'}
        </Badge>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày tạo' />
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
    },
    {
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() =>
              navigate(`/nutritionist/manage-collections/${row.original._id}`)
            }
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 className='h-4 w-4 text-destructive' />
          </Button>
        </div>
      ),
      enableSorting: false
    }
  ];

  return (
    <>
      <CommonTable
        columns={columns}
        data={data}
        enableRowSelection={true}
        enableBulkActions={true}
        onBulkAction={handleBulkAction}
        bulkActionLabel='Xóa đã chọn'
        bulkActionIcon={Trash2}
        bulkActionVariant='destructive'
        emptyMessage='Không tìm thấy bộ sưu tập.'
      />

      <DeleteCollectionDialog
        collection={collectionToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => setCollectionToDelete(null)}
      />

      <DeleteBulkCollectionsDialog
        collectionIds={selectedCollectionIds}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      />
    </>
  );
};

export default CollectionsTable;
