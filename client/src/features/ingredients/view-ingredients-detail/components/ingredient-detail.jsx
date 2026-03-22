import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { findByLabel } from '~/lib/utils';

import { useIngredients } from '../../view-ingredients/api/view-ingredient';
import { useIngredientDetail } from '../api/view-ingredient-detail';
import IngredientDetailHeader from './ingredient-detail-header';
import IngredientMainInfo from './ingredient-main-info';
import IngredientNutritionModal from './ingredient-nutrition-model';
import IngredientNutritionSection from './ingredient-nutrition-section';
import RelatedIngredientsHorizontal from './related-ingredients-horizontal';

export default function IngredientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useIngredientDetail(id);
  const { data: ingredientsData } = useIngredients();

  const item = data;
  const defaultUnit = item?.units?.find(u => u.isDefault) || item?.units?.[0];

  const nutrientList = item?.nutrition?.nutrients || [];
  const mineralList = item?.nutrition?.minerals || [];

  const calories = findByLabel(nutrientList, 'Năng lượng');
  const protein = findByLabel(nutrientList, 'Protein');
  const carbs = findByLabel(nutrientList, 'Tinh bột');
  const fat = findByLabel(nutrientList, 'Chất béo');
  const fiber = findByLabel(nutrientList, 'Chất xơ');
  const sodium = findByLabel(mineralList, 'Natri');

  const [openNutrition, setOpenNutrition] = useState(false);

  const allIngredients = ingredientsData?.docs || [];

  return (
    <div className='mx-auto w-full max-w-8xl space-y-5'>
      <IngredientDetailHeader navigate={navigate} item={item} />

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start'>
        <IngredientMainInfo
          item={item}
          defaultUnit={defaultUnit}
          calories={calories}
          protein={protein}
          carbs={carbs}
          fat={fat}
          fiber={fiber}
          sodium={sodium}
          setOpenNutrition={setOpenNutrition}
        />

        <IngredientNutritionSection item={item} />
      </div>

      <RelatedIngredientsHorizontal
        title='Nguyên liệu tương tự'
        description='Các nguyên liệu có nhóm hoặc đặc điểm gần giống'
        currentIngredient={item}
        allIngredients={allIngredients}
      />

      <IngredientNutritionModal
        open={openNutrition}
        onClose={() => setOpenNutrition(false)}
        nutrition={item?.nutrition}
      />
    </div>
  );
}
