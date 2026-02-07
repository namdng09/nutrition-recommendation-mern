import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router';

import { useDishNutritionDetail } from '../api/view-dish-nutrition-detail';
import DishNutritionContent from '../components/dish-nutrition-content';

export default function DishNutritionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useDishNutritionDetail(id);

  if (!data) {
    return (
      <div className='flex h-96 flex-col items-center justify-center space-y-4'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
        <p className='animate-pulse font-medium text-muted-foreground'>
          Đang tải dữ liệu dinh dưỡng...
        </p>
      </div>
    );
  }

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
            Phân tích thành phần món ăn
          </p>
        </div>
      </div>

      <DishNutritionContent data={data} />
    </div>
  );
}
