import { Package, Trash2 } from 'lucide-react';
import {
  FaChevronRight,
  FaFireAlt,
  FaLock,
  FaLockOpen,
  FaUser
} from 'react-icons/fa';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import StatBadge from '~/features/dishes/view-dishes/components/dish-stat-badge';
import { useRemoveFavoriteCollection } from '~/features/users/update-favorite-collection/api/update-favorite-collection';
import { useFavoriteCollections } from '~/features/users/view-favorite-collections/api/view-favorite-collections';
import { getNutritionValue } from '~/lib/utils';

export function ViewFavoriteCollections() {
  // ✅ TỰ FETCH DATA thay vì nhận từ props
  const { data: collections, isLoading } = useFavoriteCollections();

  const { mutate: removeCollection, isPending: isRemovingCollection } =
    useRemoveFavoriteCollection({
      onSuccess: response => {
        toast.success(response?.message || 'Đã xóa bộ sưu tập yêu thích');
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Xóa bộ sưu tập yêu thích thất bại'
        );
      }
    });

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='h-96 rounded-[2rem] border bg-muted animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Package className='h-16 w-16 text-muted-foreground/50 mb-4' />
          <h3 className='text-lg font-semibold mb-2'>
            Chưa có bộ sưu tập yêu thích
          </h3>
          <p className='text-sm text-muted-foreground text-center max-w-md'>
            Lưu bộ sưu tập yêu thích để nhanh chóng tìm thấy chúng
          </p>
          <Link
            to='/collections'
            className='mt-4 text-sm font-medium text-primary hover:underline'
          >
            Khám phá bộ sưu tập →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
      {collections.map(col => (
        <CollectionFavoriteCard
          key={col._id}
          collection={col}
          onRemove={() => removeCollection(col._id)}
          isRemoving={isRemovingCollection}
        />
      ))}
    </div>
  );
}

function CollectionFavoriteCard({ collection, onRemove, isRemoving }) {
  const cover =
    collection.image ||
    collection.dishes?.[0]?.image ||
    '/placeholder-collection.jpg';

  return (
    <div className='group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-background transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-900/5'>
      {/* Delete Button */}
      <Button
        variant='ghost'
        size='icon'
        className='absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-white/90 text-destructive backdrop-blur-md hover:bg-destructive hover:text-white transition'
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        disabled={isRemoving}
      >
        <Trash2 className='h-4 w-4' />
      </Button>

      {/* Link wrapper for navigation */}
      <Link
        to={`/collections/${collection._id}`}
        className='flex flex-1 flex-col'
      >
        <div className='relative h-50 w-full overflow-hidden'>
          <img
            src={cover}
            alt={collection.name}
            loading='lazy'
            className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
          />

          <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent' />

          <span
            className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase ${
              collection.isPublic
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            {collection.isPublic ? (
              <FaLockOpen size={9} />
            ) : (
              <FaLock size={9} />
            )}
            {collection.isPublic ? 'Công khai' : 'Riêng tư'}
          </span>
        </div>

        <div className='flex flex-col flex-1 p-6'>
          <h3 className='mb-3 text-xl font-bold text-foreground group-hover:text-sky-600 line-clamp-1'>
            {collection.name}
          </h3>

          <div className='flex flex-wrap gap-2 mb-5'>
            <StatBadge
              icon={<FaUser size={10} />}
              value={collection.user?.name || 'Unknown'}
              theme='gray'
            />

            <StatBadge
              icon={<FaFireAlt size={10} />}
              value={`${collection.dishes?.length ?? 0} món`}
              theme='orange'
            />
          </div>

          {collection.dishes?.[0] ? (
            <div className='mb-5 flex items-center gap-4 rounded-xl border border-border/60 bg-secondary/20 p-3'>
              <img
                src={collection.dishes[0].image || '/placeholder.png'}
                alt={collection.dishes[0].name}
                className='h-12 w-12 rounded-lg object-cover'
              />

              <div className='min-w-0'>
                <div className='truncate text-sm font-bold text-foreground'>
                  {collection.dishes[0].name}
                </div>

                <div className='text-[11px] font-medium text-muted-foreground'>
                  Món tiêu biểu •{' '}
                  {getNutritionValue(collection.dishes[0], 'Năng lượng')} kcal
                </div>
              </div>
            </div>
          ) : null}

          {collection.tags?.length > 0 && (
            <div className='flex flex-wrap gap-1.5 mb-4'>
              {collection.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className='text-[13px] font-bold text-sky-600/70'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className='mt-auto flex items-center justify-between border-t border-border/50 pt-3'>
            <span className='text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground group-hover:text-sky-600 transition-colors'>
              Khám phá ngay
            </span>

            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all group-hover:bg-sky-600 group-hover:text-white group-hover:translate-x-1'>
              <FaChevronRight size={12} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
