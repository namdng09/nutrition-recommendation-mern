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
import { useDeleteExercise } from '~/features/exercises/delete-exercise/api/delete-exercise';

const DeleteExerciseDialog = ({ exercise, open, onOpenChange, onSuccess }) => {
  const { mutate: deleteExercise, isPending } = useDeleteExercise({
    onSuccess: response => {
      toast.success(response?.message || 'Xóa bài tập thành công');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Xóa bài tập thất bại');
    }
  });

  const handleDelete = () => {
    if (exercise?._id) {
      deleteExercise(exercise._id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn không?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Việc này sẽ xóa vĩnh viễn bài tập{' '}
            <span className='font-semibold'>{exercise?.name}</span> khỏi hệ
            thống.
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

export default DeleteExerciseDialog;
