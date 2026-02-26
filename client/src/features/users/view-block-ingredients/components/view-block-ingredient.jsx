import { Ban, Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import IngredientCalories from '~/features/ingredients/view-ingredients/components/ingredient-calories';
import IngredientHeader from '~/features/ingredients/view-ingredients/components/ingredient-header';
import IngredientMacros from '~/features/ingredients/view-ingredients/components/ingredient-macros';
import IngredientMicronutrients from '~/features/ingredients/view-ingredients/components/ingredient-micronutrients';
import { useRemoveBlockIngredient } from '~/features/users/update-block-ingredient/api/update-block-ingredient';
import { useBlockIngredients } from '~/features/users/view-block-ingredients/api/view-block-ingredient';
import { findByLabel, hasValue } from '~/lib/utils';

import { ViewBlockIngredientsSkeleton } from './view-block-ingredients-skeleton';

export function ViewBlockIngredients() {
  const { data: ingredients, isLoading } = useBlockIngredients();
  const [removingId, setRemovingId] = useState(null);

  const { mutate: removeBlockIngredient } = useRemoveBlockIngredient({
    onMutate: ingredientId => {
      setRemovingId(ingredientId);
    },
    onSuccess: response => {
      toast.success(response?.message || 'Đã bỏ chặn nguyên liệu');
      setRemovingId(null);
    },
    onError: error => {
      toast.error(
        error?.response?.data?.message || 'Bỏ chặn nguyên liệu thất bại'
      );
      setRemovingId(null);
    }
  });

  if (isLoading) {
    return <ViewBlockIngredientsSkeleton />;
  }

  if (!ingredients || ingredients.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Ban className='h-16 w-16 text-muted-foreground/50 mb-4' />
          <h3 className='text-lg font-semibold mb-2'>
            Chưa có nguyên liệu bị chặn
          </h3>
          <p className='text-sm text-muted-foreground text-center max-w-md'>
            Chặn nguyên liệu để loại bỏ chúng khỏi gợi ý món ăn
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {ingredients.map(item => (
        <IngredientBlockCard
          key={item._id}
          item={item}
          onRemove={() => removeBlockIngredient(item._id)}
          isRemoving={removingId === item._id}
        />
      ))}
    </div>
  );
}

function IngredientBlockCard({ item, onRemove, isRemoving }) {
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
    <div
      className={`group relative overflow-hidden rounded-[1.75rem] border border-destructive/20 bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:border-destructive/40 hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] ${
        isRemoving ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Unblock Button */}
      <Button
        variant='ghost'
        size='icon'
        className='absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-white/90 text-emerald-600 backdrop-blur-md hover:bg-emerald-600 hover:text-white transition'
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Trash2 className='h-4 w-4' />
        )}
      </Button>

      {/* Ban Badge */}
      <div className='absolute top-3 left-3 z-10'>
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10'>
          <Ban className='h-3.5 w-3.5 text-destructive' />
        </div>
      </div>

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
