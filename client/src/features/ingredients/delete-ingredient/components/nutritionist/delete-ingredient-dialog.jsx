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
import { useDeleteIngredient } from '~/features/ingredients/delete-ingredient/api/delete-ingredient';

const DeleteIngredientDialog = ({
  ingredient,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { mutate: deleteIngredient, isPending: isDeleting } =
    useDeleteIngredient({
      onSuccess: response => {
        toast.success(response?.message || 'Xóa nguyên liệu thành công');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Xóa nguyên liệu thất bại'
        );
      }
    });

  const handleDelete = () => {
    if (ingredient) {
      deleteIngredient(ingredient._id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa nguyên liệu</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa "{ingredient?.name}"? Hành động này không
            thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteIngredientDialog;
