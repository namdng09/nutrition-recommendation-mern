import { useSearchParams } from 'react-router';

import { DataTableColumnHeader } from '~/components/admin/data-table-column-header';
import CommonTable from '~/components/common-table';
import { Badge } from '~/components/ui/badge';
import { FEEDBACK_TYPE } from '~/constants/feedback-type';
import { useFeedbacks } from '~/features/feedback/view-feebacks/api/view-feedback';
import { formatDate } from '~/lib/utils';

const FeedbackList = () => {
  const [searchParams] = useSearchParams();

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt',
    type: searchParams.get('type') || undefined,
    content: searchParams.get('content') || undefined
  };

  const { data } = useFeedbacks(params);

  const columns = [
    {
      accessorKey: 'user.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Người gửi' />
      ),
      cell: ({ row }) => <span>{row.original.user?.name || '-'}</span>
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Loại feedback' />
      ),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.type === FEEDBACK_TYPE.SYSTEM ? 'default' : 'secondary'
          }
        >
          {row.original.type}
        </Badge>
      )
    },
    {
      accessorKey: 'content',
      header: 'Nội dung',
      cell: ({ row }) => (
        <p className='max-w-xl line-clamp-2'>{row.original.content}</p>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày gửi' />
      ),
      cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>
    }
  ];

  return (
    <CommonTable
      columns={columns}
      data={data}
      emptyMessage='Chưa có feedback nào từ người dùng.'
    />
  );
};

export default FeedbackList;
