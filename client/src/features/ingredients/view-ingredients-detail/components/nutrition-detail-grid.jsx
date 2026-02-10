import { FaFireAlt } from 'react-icons/fa';
import {
  GiCottonFlower,
  GiMeat,
  GiOlive,
  GiSaltShaker,
  GiWheat
} from 'react-icons/gi';

import NutritionStatCard from './nutrition-stat-card';

export default function NutritionDetailGrid({
  item,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sodium
}) {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
      <NutritionStatCard
        icon={<FaFireAlt />}
        label={`Calo / ${item?.baseUnit?.amount}${item?.baseUnit?.unit}`}
        value={`${calories?.value ?? 0} ${calories?.unit ?? ''}`}
        color='orange'
      />

      <NutritionStatCard
        icon={<GiMeat />}
        label='Đạm (Protein)'
        value={`${protein?.value ?? 0}${protein?.unit ?? ''}`}
        color='emerald'
      />

      <NutritionStatCard
        icon={<GiWheat />}
        label='Tinh bột'
        value={`${carbs?.value ?? 0}${carbs?.unit ?? ''}`}
        color='sky'
      />

      <NutritionStatCard
        icon={<GiOlive />}
        label='Chất béo'
        value={`${fat?.value ?? 0}${fat?.unit ?? ''}`}
        color='fuchsia'
      />

      <NutritionStatCard
        icon={<GiCottonFlower />}
        label='Chất xơ'
        value={`${fiber?.value ?? 0}${fiber?.unit ?? ''}`}
        color='violet'
      />

      <NutritionStatCard
        icon={<GiSaltShaker />}
        label='Natri'
        value={`${sodium?.value ?? 0}${sodium?.unit ?? ''}`}
        color='amber'
      />
    </div>
  );
}
