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
      toast.success(response?.message || 'User deleted successfully');
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
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
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{user?.name}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
