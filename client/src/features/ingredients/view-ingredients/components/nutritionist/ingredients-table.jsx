import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Button } from '~/components/ui/button';
import { useIngredients } from '~/features/ingredients/view-ingredients/api/view-ingredient';

const IngredientsTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt',
    name: searchParams.get('name') || undefined
  };

  const { data } = useIngredients(params);

  const handleDelete = ingredient => {
    setIngredientToDelete(ingredient);
    setDeleteDialogOpen(true);
  };

  const handleBulkAction = selectedIngredients => {
    setSelectedIngredientIds(selectedIngredients.map(ing => ing._id));
    setBulkDeleteDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: 'image',
      header: 'Hình ảnh',
      cell: ({ row }) => (
        <img
          src={row.original.image}
          alt={row.original.name}
          className='h-10 w-10 object-cover rounded'
        />
      ),
      enableSorting: false
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tên' />
      )
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Danh mục' />
      )
    },
    {
      accessorKey: 'calories',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Calories' />
      ),
      cell: ({ row }) => `${row.original.calories} kcal`
    },
    {
      accessorKey: 'protein',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Protein' />
      ),
      cell: ({ row }) => `${row.original.protein}g`
    },
    {
      accessorKey: 'carbs',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Carbs' />
      ),
      cell: ({ row }) => `${row.original.carbs}g`
    },
    {
      accessorKey: 'fat',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fat' />
      ),
      cell: ({ row }) => `${row.original.fat}g`
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
              navigate(`/nutritionist/manage-ingredients/${row.original._id}`)
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
        emptyMessage='Không tìm thấy nguyên liệu.'
      />

      {/* TODO: Add DeleteIngredientDialog and DeleteBulkIngredientsDialog */}
    </>
  );
};

export default IngredientsTable;
