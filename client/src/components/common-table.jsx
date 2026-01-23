import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { DataTablePagination } from '~/components/admin/data-table-pagination';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';

const CommonTable = ({
  columns: baseColumns,
  data,
  enableRowSelection = false,
  enableBulkActions = false,
  onBulkAction,
  bulkActionLabel = 'Delete Selected',
  bulkActionIcon: BulkActionIcon = Trash2,
  bulkActionVariant = 'destructive',
  emptyMessage = 'No results found.'
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rowSelection, setRowSelection] = useState({});

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || '-createdAt'
  };

  const parseSorting = sortString => {
    if (!sortString) return [];
    return sortString.split(',').map(s => {
      const desc = s.startsWith('-');
      const id = desc ? s.slice(1) : s;
      return { id, desc };
    });
  };

  const sorting = parseSorting(params.sort);

  const handleSortingChange = updater => {
    const newSorting =
      typeof updater === 'function' ? updater(sorting) : updater;

    const newParams = new URLSearchParams(searchParams);
    if (newSorting.length) {
      const sortString = newSorting
        .map(s => (s.desc ? `-${s.id}` : s.id))
        .join(',');
      newParams.set('sort', sortString);
    } else {
      newParams.set('sort', '-createdAt');
    }

    setSearchParams(newParams);
  };

  const handlePaginationChange = updater => {
    const currentPagination = {
      pageIndex: params.page - 1,
      pageSize: params.limit
    };

    const newPagination =
      typeof updater === 'function' ? updater(currentPagination) : updater;

    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', (newPagination.pageIndex + 1).toString());
    newParams.set('limit', newPagination.pageSize.toString());

    setSearchParams(newParams);
  };

  // Add selection column if row selection is enabled
  const columns = enableRowSelection
    ? [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={value =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label='Select all'
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={value => row.toggleSelected(!!value)}
              aria-label='Select row'
            />
          ),
          enableSorting: false
        },
        ...baseColumns
      ]
    : baseColumns;

  const table = useReactTable({
    data: data?.docs || [],
    columns,
    pageCount: data?.totalPages || 0,
    state: {
      pagination: {
        pageIndex: params.page - 1,
        pageSize: params.limit
      },
      sorting,
      rowSelection
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkActionClick = () => {
    if (onBulkAction) {
      const selectedData = selectedRows.map(row => row.original);
      onBulkAction(selectedData, () => setRowSelection({}));
    }
  };

  return (
    <>
      {enableBulkActions && selectedRows.length > 0 && (
        <div className='flex items-center justify-between rounded-md border bg-muted/50 p-4 mb-4'>
          <div className='text-sm text-muted-foreground'>
            {selectedRows.length} {selectedRows.length === 1 ? 'row' : 'rows'}{' '}
            selected
          </div>
          <Button
            variant={bulkActionVariant}
            size='sm'
            onClick={handleBulkActionClick}
          >
            <BulkActionIcon className='mr-2 h-4 w-4' />
            {bulkActionLabel}
          </Button>
        </div>
      )}

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </>
  );
};

export default CommonTable;
