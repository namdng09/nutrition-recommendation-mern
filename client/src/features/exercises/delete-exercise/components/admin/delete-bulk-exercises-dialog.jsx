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
import { useDeleteBulkExercises } from '~/features/exercises/delete-exercise/api/delete-exercise';

const DeleteBulkExercisesDialog = ({ exerciseIds, open, onOpenChange }) => {
  const { mutate: deleteBulkExercises, isPending } = useDeleteBulkExercises({
    onSuccess: response => {
      toast.success(response?.message || 'Xóa bài tập thành công');
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa bài tập thất bại');
    }
  });

  const handleDelete = () => {
    if (!exerciseIds || exerciseIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một bài tập để xóa');
      return;
    }
    deleteBulkExercises(exerciseIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn không?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn{' '}
            <span className='font-semibold'>{exerciseIds?.length || 0}</span>{' '}
            bài tập khỏi hệ thống.
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

export default DeleteBulkExercisesDialog;
