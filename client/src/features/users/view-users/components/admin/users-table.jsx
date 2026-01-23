import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import DeleteBulkUsersDialog from '~/features/users/delete-user/components/admin/delete-bulk-users-dialog';
import DeleteUserDialog from '~/features/users/delete-user/components/admin/delete-user-dialog';
import { useUsers } from '~/features/users/view-users/api/view-users';

const UsersTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt',
    name: searchParams.get('name') || undefined,
    gender: searchParams.getAll('gender').length
      ? searchParams.getAll('gender')
      : undefined,
    role: searchParams.getAll('role').length
      ? searchParams.getAll('role')
      : undefined
  };

  const { data } = useUsers(params);

  const handleDelete = user => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleBulkAction = selectedUsers => {
    setSelectedUserIds(selectedUsers.map(user => user._id));
    setBulkDeleteDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: 'avatar',
      header: 'Ảnh đại diện',
      cell: ({ row }) => (
        <Avatar className='h-10 w-10'>
          <AvatarImage src={row.original.avatar} alt={row.original.name} />
          <AvatarFallback>
            <img
              src='/default-avatar.jpg'
              alt='Default avatar'
              className='h-full w-full object-cover'
            />
          </AvatarFallback>
        </Avatar>
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
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      )
    },
    {
      accessorKey: 'gender',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Giới tính' />
      ),
      cell: ({ row }) => (
        <span className='capitalize'>{row.original.gender}</span>
      )
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Vai trò' />
      ),
      cell: ({ row }) => <span className='capitalize'>{row.original.role}</span>
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Trạng thái' />
      ),
      cell: ({ row }) => (
        <span>{row.original.isActive ? 'Active' : 'Inactive'}</span>
      )
    },
    {
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate(`/admin/manage-users/${row.original._id}`)}
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
        emptyMessage='Không tìm thấy người dùng.'
      />

      <DeleteUserDialog
        user={userToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <DeleteBulkUsersDialog
        userIds={selectedUserIds}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      />
    </>
  );
};

export default UsersTable;
