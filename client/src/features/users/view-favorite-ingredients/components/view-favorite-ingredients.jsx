import { Heart, Salad, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import IngredientCalories from '~/features/ingredients/view-ingredients/components/ingredient-calories';
import IngredientHeader from '~/features/ingredients/view-ingredients/components/ingredient-header';
import IngredientMacros from '~/features/ingredients/view-ingredients/components/ingredient-macros';
import IngredientMicronutrients from '~/features/ingredients/view-ingredients/components/ingredient-micronutrients';
import { useRemoveFavoriteIngredient } from '~/features/users/update-favorite-ingredient/api/update-favorite-ingredient';
import { useFavoriteIngredients } from '~/features/users/view-favorite-ingredients/api/view-favorite-ingredients';
import { findByLabel, hasValue } from '~/lib/utils';

export function ViewFavoriteIngredients() {
  // ✅ TỰ FETCH DATA thay vì nhận từ props
  const { data: ingredients, isLoading } = useFavoriteIngredients();

  const { mutate: removeIngredient, isPending: isRemovingIngredient } =
    useRemoveFavoriteIngredient({
      onSuccess: response => {
        toast.success(response?.message || 'Đã xóa nguyên liệu yêu thích');
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Xóa nguyên liệu yêu thích thất bại'
        );
      }
    });

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='rounded-2xl border border-border bg-background/80 p-5 shadow-sm'
          >
            <div className='flex gap-4'>
              <div className='h-20 w-20 rounded-2xl bg-muted animate-pulse' />
              <div className='flex-1 space-y-3'>
                <div className='h-5 w-32 rounded-lg bg-muted animate-pulse' />
                <div className='h-4 w-24 rounded-lg bg-muted animate-pulse' />
                <div className='grid grid-cols-2 gap-2 mt-4'>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <div
                      key={j}
                      className='h-16 rounded-xl bg-muted animate-pulse'
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!ingredients || ingredients.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Salad className='h-16 w-16 text-muted-foreground/50 mb-4' />
          <h3 className='text-lg font-semibold mb-2'>
            Chưa có nguyên liệu yêu thích
          </h3>
          <p className='text-sm text-muted-foreground text-center max-w-md'>
            Thêm nguyên liệu yêu thích để dễ dàng tìm kiếm và sử dụng
          </p>
          <Link
            to='/ingredients'
            className='mt-4 text-sm font-medium text-primary hover:underline'
          >
            Khám phá nguyên liệu →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {ingredients.map(item => (
        <IngredientFavoriteCard
          key={item._id}
          item={item}
          onRemove={() => removeIngredient(item._id)}
          isRemoving={isRemovingIngredient}
        />
      ))}
    </div>
  );
}

function IngredientFavoriteCard({ item, onRemove, isRemoving }) {
  const nutrition = item?.nutrition || {};
  const nutrients = nutrition?.nutrients || [];
  const minerals = nutrition?.minerals || [];
  const vitamins = nutrition?.vitamins || [];

  const { calories, protein, carbs, fat } = useMemo(
    () => ({
      calories: findByLabel(nutrients, 'Năng lượng'),
      protein: findByLabel(nutrients, 'Protein'),
      carbs: findByLabel(nutrients, 'Tinh bột'),
      fat: findByLabel(nutrients, 'Chất béo')
    }),
    [nutrients]
  );

  const hasCalories = hasValue(calories);
  const hasMacros = hasValue(protein) || hasValue(carbs) || hasValue(fat);

  return (
    <div className='group relative overflow-hidden rounded-[1.75rem] border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)]'>
      {/* Delete Button */}
      <Button
        variant='ghost'
        size='icon'
        className='absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-white/90 text-destructive backdrop-blur-md hover:bg-destructive hover:text-white transition'
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
      <Link to={`/ingredients/${item._id}`} className='block'>
        <IngredientHeader item={item} />

        {hasCalories && <IngredientCalories calories={calories} />}

        {hasMacros && (
          <IngredientMacros protein={protein} carbs={carbs} fat={fat} />
        )}

        {!hasCalories && !hasMacros && (
          <IngredientMicronutrients minerals={minerals} vitamins={vitamins} />
        )}
      </Link>
    </div>
  );
}
