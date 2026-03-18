import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ROLE } from '~/constants/role';
import DeleteBulkPostsDialog from '~/features/post/delete-post/components/nutritionist/delete-bulk-posts-dialog';
import DeletePostDialog from '~/features/post/delete-post/components/nutritionist/delete-post-dialog';
import { usePost } from '~/features/post/view-post/api/view-post';
import { formatDate } from '~/lib/utils';

const PostsTable = ({ viewDetailPath }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState([]);

  // Lấy user từ Redux store
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role === ROLE.ADMIN;

  // Xác định đường dẫn view detail dựa trên role hoặc prop
  const detailPath =
    viewDetailPath ||
    (isAdmin ? '/admin/manage-posts' : '/nutritionist/manage-posts');

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt',
    title: searchParams.get('title') || undefined,
    category: searchParams.get('category') || undefined,
    isPublished: searchParams.get('isPublished') || undefined
  };

  const { data } = usePost(params);

  const handleDelete = post => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleBulkAction = selectedPosts => {
    setSelectedPostIds(selectedPosts.map(post => post._id));
    setBulkDeleteDialogOpen(true);
  };

  const handleViewDetail = postId => {
    navigate(`${detailPath}/${postId}`);
  };

  const columns = [
    {
      accessorKey: 'images',
      header: 'Hình ảnh',
      cell: ({ row }) => (
        <img
          src={row.original.images?.[0] || 'https://via.placeholder.com/40'}
          alt={row.original.title}
          className='h-10 w-10 object-cover rounded'
        />
      ),
      enableSorting: false
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tiêu đề' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium line-clamp-2'>{row.original.title}</span>
          <span className='text-xs text-muted-foreground'>
            {row.original.slug}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Danh mục',
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <Badge variant='secondary'>{category}</Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        if (tags.length === 0) {
          return <span className='text-muted-foreground'>-</span>;
        }
        return (
          <div className='flex gap-1 flex-wrap'>
            {tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} variant='outline' className='text-xs'>
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant='outline' className='text-xs'>
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'isPublished',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const isPublished = row.original.isPublished;
        return (
          <Badge variant={isPublished ? 'default' : 'secondary'}>
            {isPublished ? 'Công khai' : 'Riêng tư'}
          </Badge>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'views',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Lượt xem' />
      ),
      cell: ({ row }) => <span>{row.original.views || 0}</span>
    },
    {
      accessorKey: 'likes',
      header: 'Lượt thích',
      cell: ({ row }) => {
        const likes = row.original.likes || [];
        return <span>{likes.length}</span>;
      },
      enableSorting: false
    },
    {
      accessorKey: 'comments',
      header: 'Bình luận',
      cell: ({ row }) => {
        const comments = row.original.comments || [];
        return <span>{comments.length}</span>;
      },
      enableSorting: false
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày tạo' />
      ),
      cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>
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
        emptyMessage='Không tìm thấy bài viết.'
      />

      <DeletePostDialog
        post={postToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => setPostToDelete(null)}
      />

      <DeleteBulkPostsDialog
        postIds={selectedPostIds}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      />
    </>
  );
};

export default PostsTable;
