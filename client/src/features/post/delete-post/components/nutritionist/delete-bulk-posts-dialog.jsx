import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { useDeleteBulkPosts } from '~/features/post/delete-post/api/delete-post';

const DeleteBulkPostsDialog = ({ open, onOpenChange, postIds }) => {
  const deleteBulkPostsMutation = useDeleteBulkPosts();

  const handleDelete = () => {
    if (!postIds || postIds.length === 0) return;

    deleteBulkPostsMutation.mutate(postIds, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa nhiều bài viết</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa {postIds?.length} bài viết đã chọn? Hành
            động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deleteBulkPostsMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleteBulkPostsMutation.isPending}
          >
            {deleteBulkPostsMutation.isPending ? 'Đang xóa...' : 'Xóa tất cả'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBulkPostsDialog;
