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
      toast.success(response?.message || 'Users deleted successfully');
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Failed to delete users');
    }
  });

  const handleDelete = () => {
    deleteBulkUsers(userIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete{' '}
            <span className='font-semibold'>{userIds?.length || 0}</span>{' '}
            {userIds?.length === 1 ? 'user' : 'users'} from the system.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBulkUsersDialog;
