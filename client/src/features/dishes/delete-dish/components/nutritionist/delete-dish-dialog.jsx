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
import { useDeleteDish } from '~/features/dishes/delete-dish/api/delete-dish';

const DeleteDishDialog = ({ dish, open, onOpenChange, onSuccess }) => {
  const { mutate: deleteDish, isPending } = useDeleteDish({
    onSuccess: response => {
      toast.success(response?.message || 'Xóa món ăn thành công');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa món ăn thất bại');
    }
  });

  const handleDelete = () => {
    if (dish?._id) {
      deleteDish(dish._id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn không?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn món ăn{' '}
            <span className='font-semibold'>{dish?.name}</span> khỏi hệ thống.
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

export default DeleteDishDialog;
