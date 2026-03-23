import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ROLE } from '~/constants/role';
import DeleteBulkExercisesDialog from '~/features/exercises/delete-exercise/components/admin/delete-bulk-exercises-dialog';
import DeleteExerciseDialog from '~/features/exercises/delete-exercise/components/admin/delete-exercise-dialog';
import { useExercises } from '~/features/exercises/view-exercises/api/view-exercises';

const ExercisesTable = ({ viewDetailPath }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);

  // Get user from Redux store
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role === ROLE.ADMIN;

  // Determine detail path based on role or prop
  const detailPath =
    viewDetailPath ||
    (isAdmin ? '/admin/manage-exercises' : '/nutritionist/manage-exercises');

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt',
    name: searchParams.get('name') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
    type: searchParams.get('type') || undefined
  };

  const { data } = useExercises(params);

  const handleDelete = exercise => {
    setExerciseToDelete(exercise);
    setDeleteDialogOpen(true);
  };

  const handleBulkAction = selectedExercises => {
    setSelectedExerciseIds(selectedExercises.map(exercise => exercise._id));
    setBulkDeleteDialogOpen(true);
  };

  const handleViewDetail = exerciseId => {
    navigate(`${detailPath}/${exerciseId}`);
  };

  const columns = [
    {
      accessorKey: 'tutorial',
      header: 'Hình ảnh',
      cell: ({ row }) => (
        <img
          src={row.original.tutorial || 'https://via.placeholder.com/40'}
          alt={row.original.name}
          className='h-10 w-10 object-cover rounded'
        />
      ),
      enableSorting: false
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tên bài tập' />
      )
    },
    {
      accessorKey: 'difficulty',
      header: 'Độ khó',
      cell: ({ row }) => {
        const difficultyColors = {
          'Cơ bản': 'bg-green-100 text-green-800 border-green-200',
          'Trung bình': 'bg-yellow-100 text-yellow-800 border-yellow-200',
          'Nâng cao': 'bg-red-100 text-red-800 border-red-200'
        };
        return (
          <Badge
            variant='outline'
            className={difficultyColors[row.original.difficulty] || ''}
          >
            {row.original.difficulty}
          </Badge>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'type',
      header: 'Loại hình',
      cell: ({ row }) => (
        <Badge variant='outline' className='text-xs'>
          {row.original.type}
        </Badge>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'muscles',
      header: 'Nhóm cơ',
      cell: ({ row }) => (
        <div className='flex gap-1 flex-wrap max-w-xs'>
          {row.original.muscles?.slice(0, 3).map((muscle, idx) => (
            <Badge key={idx} variant='secondary' className='text-xs'>
              {muscle.name}
            </Badge>
          ))}
          {row.original.muscles?.length > 3 && (
            <Badge variant='secondary' className='text-xs'>
              +{row.original.muscles.length - 3}
            </Badge>
          )}
        </div>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'equipments',
      header: 'Thiết bị',
      cell: ({ row }) => (
        <div className='flex gap-1 flex-wrap max-w-xs'>
          {row.original.equipments?.slice(0, 2).map((equipment, idx) => (
            <Badge key={idx} variant='outline' className='text-xs'>
              {equipment.name}
            </Badge>
          ))}
          {row.original.equipments?.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{row.original.equipments.length - 2}
            </Badge>
          )}
        </div>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'logType',
      header: 'Loại đếm',
      cell: ({ row }) => (
        <Badge variant='secondary' className='text-xs'>
          {row.original.logType}
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
        emptyMessage='Không tìm thấy bài tập.'
      />

      <DeleteExerciseDialog
        exercise={exerciseToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => setExerciseToDelete(null)}
      />

      <DeleteBulkExercisesDialog
        exerciseIds={selectedExerciseIds}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      />
    </>
  );
};

export default ExercisesTable;
