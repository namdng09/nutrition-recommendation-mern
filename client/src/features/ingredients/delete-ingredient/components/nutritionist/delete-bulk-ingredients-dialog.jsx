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
import { useDeleteBulkIngredients } from '~/features/ingredients/delete-ingredient/api/delete-ingredient';

const DeleteBulkIngredientsDialog = ({ ingredientIds, open, onOpenChange }) => {
  const { mutate: deleteBulkIngredients, isPending } = useDeleteBulkIngredients(
    {
      onSuccess: response => {
        toast.success(response?.message || 'Xóa nguyên liệu thành công');
        onOpenChange(false);
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Xóa nguyên liệu thất bại'
        );
      }
    }
  );

  const handleDelete = () => {
    deleteBulkIngredients(ingredientIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn không?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn{' '}
            <span className='font-semibold'>{ingredientIds?.length || 0}</span>{' '}
            nguyên liệu khỏi hệ thống.
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

export default DeleteBulkIngredientsDialog;
