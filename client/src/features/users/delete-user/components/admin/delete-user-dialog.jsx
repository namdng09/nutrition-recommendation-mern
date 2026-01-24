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
import { useDeleteUser } from '~/features/users/delete-user/api/delete-user';

const DeleteUserDialog = ({ user, open, onOpenChange, onSuccess }) => {
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser({
    onSuccess: response => {
      toast.success(response?.message || 'Xóa người dùng thành công');
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa người dùng thất bại');
    }
  });

  const handleDelete = () => {
    if (user) {
      deleteUser(user._id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa người dùng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa "{user?.name}"? Hành động này không thể
            hoàn tác.
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

export default DeleteUserDialog;
