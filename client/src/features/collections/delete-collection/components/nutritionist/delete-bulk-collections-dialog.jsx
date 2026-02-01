import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { useDeleteBulkCollections } from '~/features/collections/delete-collection/api/delete-collection';

const DeleteBulkCollectionsDialog = ({ collectionIds, open, onOpenChange }) => {
  const { mutate: deleteBulkCollections, isPending } = useDeleteBulkCollections(
    {
      onSuccess: response => {
        toast.success(response?.message || 'Xóa bộ sưu tập thành công');
        onOpenChange(false);
      },
      onError: error => {
        toast.error(error.response?.data?.message || 'Xóa bộ sưu tập thất bại');
      }
    }
  );

  const handleDelete = () => {
    if (collectionIds?.length > 0) {
      deleteBulkCollections(collectionIds);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn không?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn{' '}
            <span className='font-semibold'>{collectionIds?.length || 0}</span>{' '}
            bộ sưu tập khỏi hệ thống.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBulkCollectionsDialog;
