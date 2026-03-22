import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ROLE } from '~/constants/role';
import DeleteBulkIngredientsDialog from '~/features/ingredients/delete-ingredient/components/nutritionist/delete-bulk-ingredients-dialog';
import DeleteIngredientDialog from '~/features/ingredients/delete-ingredient/components/nutritionist/delete-ingredient-dialog';
import { useIngredients } from '~/features/ingredients/view-ingredients/api/view-ingredient';
const IngredientsTable = ({ viewDetailPath }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);

  // Lấy user từ Redux store
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role === ROLE.ADMIN;

  // Xác định đường dẫn view detail dựa trên role hoặc prop
  const detailPath =
    viewDetailPath ||
    (isAdmin
      ? '/admin/manage-ingredients'
      : '/nutritionist/manage-ingredients');

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

  // Helper function để lấy giá trị nutrient từ array
  const getNutrientValue = (nutrients, label) => {
    const nutrient = nutrients?.find(n => n.label === label);
    return nutrient ? `${nutrient.value} ${nutrient.unit}` : '-';
  };

  const handleViewDetail = ingredientId => {
    navigate(`${detailPath}/${ingredientId}`);
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
        <DataTableColumnHeader column={column} title='Tên' />
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
      accessorKey: 'nutrition.nutrients',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Năng lượng' />
      ),
      cell: ({ row }) => {
        const nutrients = row.original.nutrition?.nutrients || [];
        return getNutrientValue(nutrients, 'Năng lượng');
      }
    },
    {
      accessorKey: 'nutrition.nutrients.protein',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Protein' />
      ),
      cell: ({ row }) => {
        const nutrients = row.original.nutrition?.nutrients || [];
        return getNutrientValue(nutrients, 'Protein');
      }
    },
    {
      accessorKey: 'nutrition.nutrients.carbs',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tinh bột' />
      ),
      cell: ({ row }) => {
        const nutrients = row.original.nutrition?.nutrients || [];
        return getNutrientValue(nutrients, 'Tinh bột');
      }
    },
    {
      accessorKey: 'nutrition.nutrients.fat',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Chất béo' />
      ),
      cell: ({ row }) => {
        const nutrients = row.original.nutrition?.nutrients || [];
        return getNutrientValue(nutrients, 'Chất béo');
      }
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
        emptyMessage='Không tìm thấy nguyên liệu.'
      />

      <DeleteIngredientDialog
        ingredient={ingredientToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => setIngredientToDelete(null)}
      />

      <DeleteBulkIngredientsDialog
        ingredientIds={selectedIngredientIds}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      />
    </>
  );
};

export default IngredientsTable;
