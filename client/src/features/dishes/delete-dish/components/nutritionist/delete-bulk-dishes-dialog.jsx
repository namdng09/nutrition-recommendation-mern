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
import { useDeleteBulkDishes } from '~/features/dishes/delete-dish/api/delete-dish';

const DeleteBulkDishesDialog = ({ dishIds, open, onOpenChange }) => {
  const { mutate: deleteBulkDishes, isPending } = useDeleteBulkDishes({
    onSuccess: response => {
      toast.success(response?.message || 'Xóa món ăn thành công');
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa món ăn thất bại');
    }
  });

  const handleDelete = () => {
    if (!dishIds || dishIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một món ăn để xóa');
      return;
    }
    deleteBulkDishes(dishIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn không?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn{' '}
            <span className='font-semibold'>{dishIds?.length || 0}</span> món ăn
            khỏi hệ thống.
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

export default DeleteBulkDishesDialog;
