import React, { useMemo } from 'react';

import { findByLabel, hasValue } from '~/lib/utils';

import IngredientCalories from './ingredient-calories';
import IngredientHeader from './ingredient-header';
import IngredientMacros from './ingredient-macros';
import IngredientMicronutrients from './ingredient-micronutrients';

export default function IngredientCard({ item }) {
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
      <IngredientHeader item={item} />

      {hasCalories && <IngredientCalories calories={calories} />}

      {hasMacros && (
        <IngredientMacros protein={protein} carbs={carbs} fat={fat} />
      )}

      {!hasCalories && !hasMacros && (
        <IngredientMicronutrients minerals={minerals} vitamins={vitamins} />
      )}
    </div>
  );
}
