import React, { useMemo } from 'react';

import IngredientRelatedCard from './ingredient-related-card';

export default function RelatedIngredientsHorizontal({
  title = 'Nguyên liệu liên quan',
  description = 'Khám phá thêm các nguyên liệu tương tự',
  currentIngredient,
  allIngredients = [],
  limit = 8
}) {
  const relatedIngredients = useMemo(() => {
    if (!currentIngredient || !Array.isArray(allIngredients)) return [];

    const currentCategories = new Set(
      (currentIngredient.categories || []).map(category =>
        String(category).toLowerCase()
      )
    );

    const currentAllergens = new Set(
      (currentIngredient.allergens || []).map(allergen =>
        String(allergen).toLowerCase()
      )
    );

    const currentBaseUnit = String(
      currentIngredient?.baseUnit?.unit || ''
    ).toLowerCase();

    const scoredIngredients = allIngredients
      .filter(item => String(item._id) !== String(currentIngredient._id))
      .map(item => {
        const sharedCategories = (item.categories || []).filter(category =>
          currentCategories.has(String(category).toLowerCase())
        ).length;

        const sharedAllergens = (item.allergens || []).filter(allergen =>
          currentAllergens.has(String(allergen).toLowerCase())
        ).length;

        const sameBaseUnit =
          String(item?.baseUnit?.unit || '').toLowerCase() === currentBaseUnit
            ? 1
            : 0;

        const score =
          sharedCategories * 10 + sharedAllergens * 4 + sameBaseUnit * 2;

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredIngredients.length >= limit) {
      return scoredIngredients.slice(0, limit);
    }

    const selectedIds = new Set(
      scoredIngredients.map(item => String(item._id))
    );

    const fallbackIngredients = allIngredients
      .filter(
        item =>
          String(item._id) !== String(currentIngredient._id) &&
          !selectedIds.has(String(item._id))
      )
      .slice(0, limit - scoredIngredients.length);

    return [...scoredIngredients, ...fallbackIngredients].slice(0, limit);
  }, [currentIngredient, allIngredients, limit]);

  if (!relatedIngredients.length) return null;

  return (
    <section className='mt-8 space-y-6'>
      <div className='rounded-[28px] bg-card/70 p-5 shadow-sm ring-1 ring-border/60 backdrop-blur sm:p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-2xl font-black tracking-tight text-foreground'>
              {title}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
          </div>

          <span className='inline-flex w-fit items-center rounded-full bg-muted px-4 py-1.5 text-sm font-bold text-muted-foreground'>
            {relatedIngredients.length} nguyên liệu
          </span>
        </div>
      </div>

      <div className='-mx-4 overflow-x-auto px-4 pb-2'>
        <div className='flex gap-5'>
          {relatedIngredients.map(ingredient => (
            <IngredientRelatedCard
              key={ingredient._id}
              ingredient={ingredient}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
