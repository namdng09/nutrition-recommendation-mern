import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { useDeletePost } from '~/features/post/delete-post/api/delete-post';

const DeletePostDialog = ({ open, onOpenChange, post, onSuccess }) => {
  const deletePostMutation = useDeletePost();

  const handleDelete = () => {
    if (!post?._id) return;

    deletePostMutation.mutate(post._id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa bài viết "{post?.title}"? Hành động này
            không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deletePostMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deletePostMutation.isPending}
          >
            {deletePostMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePostDialog;
