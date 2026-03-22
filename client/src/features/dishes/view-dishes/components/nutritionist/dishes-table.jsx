import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ROLE } from '~/constants/role';
import DeleteBulkDishesDialog from '~/features/dishes/delete-dish/components/nutritionist/delete-bulk-dishes-dialog';
import DeleteDishDialog from '~/features/dishes/delete-dish/components/nutritionist/delete-dish-dialog';
import { useDishes } from '~/features/dishes/view-dishes/api/view-dishes';

const DishesTable = ({ viewDetailPath }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedDishIds, setSelectedDishIds] = useState([]);

  // Lấy user từ Redux store
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role === ROLE.ADMIN;

  // Xác định đường dẫn view detail dựa trên role hoặc prop
  const detailPath =
    viewDetailPath ||
    (isAdmin ? '/admin/manage-dishes' : '/nutritionist/manage-dishes');

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt',
    name: searchParams.get('name') || undefined,
    category: searchParams.get('category') || undefined
  };

  const { data } = useDishes(params);

  const handleDelete = dish => {
    setDishToDelete(dish);
    setDeleteDialogOpen(true);
  };

  const handleBulkAction = selectedDishes => {
    setSelectedDishIds(selectedDishes.map(dish => dish._id));
    setBulkDeleteDialogOpen(true);
  };

  const handleViewDetail = dishId => {
    navigate(`${detailPath}/${dishId}`);
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
        <DataTableColumnHeader column={column} title='Tên món ăn' />
      )
    },
    {
      accessorKey: 'categories',
      header: 'Danh mục',
      cell: ({ row }) => (
        <div className='flex gap-1 flex-wrap'>
          {row.original.categories?.map((cat, idx) => (
            <Badge key={idx} variant='outline' className='text-xs'>
              {cat}
            </Badge>
          )) || '-'}
        </div>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'user.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Người tạo' />
      ),
      cell: ({ row }) => row.original.user?.name || '-'
    },
    {
      accessorKey: 'servings',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Khẩu phần' />
      ),
      cell: ({ row }) => `${row.original.servings || 1} phần`
    },
    {
      accessorKey: 'preparationTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Thời gian chuẩn bị' />
      ),
      cell: ({ row }) =>
        row.original.preparationTime
          ? `${row.original.preparationTime} phút`
          : '-'
    },
    {
      accessorKey: 'cookTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Thời gian nấu' />
      ),
      cell: ({ row }) =>
        row.original.cookTime ? `${row.original.cookTime} phút` : '-'
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
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => handleViewDetail(row.original._id)}
            title='Xem chi tiết'
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => handleDelete(row.original)}
            title='Xóa'
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
        emptyMessage='Không tìm thấy món ăn.'
      />

      <DeleteDishDialog
        dish={dishToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => setDishToDelete(null)}
      />

      <DeleteBulkDishesDialog
        dishIds={selectedDishIds}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      />
    </>
  );
};

export default DishesTable;
