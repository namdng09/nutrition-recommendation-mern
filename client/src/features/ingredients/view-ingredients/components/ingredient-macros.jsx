import React from 'react';
import { FaChartPie, FaLeaf, FaWind } from 'react-icons/fa';

import { hasValue } from '~/lib/utils';

import MacroItem from './macro-item';

export default function IngredientMacros({ protein, carbs, fat }) {
  return (
    <div className='grid grid-cols-3 gap-3'>
      {hasValue(protein) && (
        <MacroItem
          label='Đạm'
          value={protein.value}
          unit={protein.unit}
          color='bg-emerald-500'
          icon={<FaLeaf className='text-emerald-500' />}
        />
      )}

      {hasValue(carbs) && (
        <MacroItem
          label='Tinh bột'
          value={carbs.value}
          unit={carbs.unit}
          color='bg-sky-500'
          icon={<FaChartPie className='text-sky-500' />}
        />
      )}

      {hasValue(fat) && (
        <MacroItem
          label='Béo'
          value={fat.value}
          unit={fat.unit}
          color='bg-amber-500'
          icon={<FaWind className='text-amber-500' />}
        />
      )}
    </div>
  );
}
