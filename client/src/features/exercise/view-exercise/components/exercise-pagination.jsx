import { Button } from '~/components/ui/button';

export default function ExercisePagination({
  page,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPrev,
  onNext
}) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className='flex items-center justify-center gap-4 pt-6'>
      <Button variant='outline' onClick={onPrev} disabled={!hasPrevPage}>
        ← Trước
      </Button>

      <div className='text-sm text-muted-foreground'>
        Trang <span className='font-semibold text-foreground'>{page}</span> /{' '}
        <span className='font-semibold text-foreground'>{totalPages}</span>
      </div>

      <Button variant='outline' onClick={onNext} disabled={!hasNextPage}>
        Sau →
      </Button>
    </div>
  );
}
