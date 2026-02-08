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
import { useDeleteCollection } from '~/features/collections/delete-collection/api/delete-collection';

const DeleteCollectionDialog = ({
  collection,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { mutate: deleteCollection, isPending } = useDeleteCollection({
    onSuccess: response => {
      toast.success(response?.message || 'Xóa bộ sưu tập thành công');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa bộ sưu tập thất bại');
    }
  });

  const handleDelete = () => {
    if (collection?._id) {
      deleteCollection(collection._id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa bộ sưu tập</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa "{collection?.name}"? Hành động này không
            thể hoàn tác.
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

export default DeleteCollectionDialog;
