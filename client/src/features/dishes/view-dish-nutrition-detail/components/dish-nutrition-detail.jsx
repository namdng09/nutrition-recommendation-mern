import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router';

import { filterNutrients, findNutrientValue } from '~/lib/utils';

import { useDishesDetail } from '../../view-dishes-detail/api/view-dishes-detail';
import DishNutritionContent from '../components/dish-nutrition-content';
import DishNutritionEmpty from './dish-nutrition-empty';

export default function DishNutritionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useDishesDetail(id);
  const dish = data;

  if (!dish) {
    return <DishNutritionEmpty />;
  }

  const nutritionData = {
    nutrients: {
      calories: {
        value: findNutrientValue(dish.nutrition, 'Năng lượng')
      },
      carbs: {
        value: findNutrientValue(dish.nutrition, 'Tinh bột')
      },
      fat: {
        value: findNutrientValue(dish.nutrition, 'Chất béo')
      },
      protein: {
        value: findNutrientValue(dish.nutrition, 'Protein')
      }
    },
    vitamins: dish.nutrition?.vitamins ?? [],
    minerals: dish.nutrition?.minerals ?? [],
    fats: filterNutrients(dish.nutrition, ['cholesterol', 'phytosterol']),
    sugars: filterNutrients(dish.nutrition, ['đường', 'chất xơ'])
  };

  return (
    <div className='mx-auto max-w-5xl space-y-8 p-4 md:p-8'>
      <div className='flex items-center justify-between'>
        <button
          onClick={() => navigate(-1)}
          className='group flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold text-muted-foreground shadow-sm border border-border hover:text-primary'
        >
          <HiOutlineArrowLeft className='transition-transform group-hover:-translate-x-1' />
          Quay lại
        </button>

        <div className='text-right'>
          <h1 className='text-2xl md:text-4xl font-black tracking-tight'>
            Thông tin <span className='text-primary'>dinh dưỡng</span>
          </h1>

          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
            {dish.name}
          </p>
        </div>
      </div>

      <DishNutritionContent data={nutritionData} />
    </div>
  );
}
