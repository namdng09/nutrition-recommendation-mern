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
import { useDeleteBulkUsers } from '~/features/users/delete-user/api/delete-user';

const DeleteBulkUsersDialog = ({ userIds, open, onOpenChange }) => {
  const { mutate: deleteBulkUsers, isPending } = useDeleteBulkUsers({
    onSuccess: response => {
      toast.success(response?.message || 'Xóa người dùng thành công');
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa người dùng thất bại');
    }
  });

  const handleDelete = () => {
    deleteBulkUsers(userIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn không?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn{' '}
            <span className='font-semibold'>{userIds?.length || 0}</span> người
            dùng khỏi hệ thống.
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

export default DeleteBulkUsersDialog;
