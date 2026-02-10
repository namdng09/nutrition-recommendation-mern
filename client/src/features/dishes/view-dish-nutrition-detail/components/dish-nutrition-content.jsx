import { FaLeaf, FaWater } from 'react-icons/fa';
import {
  HiOutlineBeaker,
  HiOutlineLightningBolt,
  HiOutlineScale
} from 'react-icons/hi';

import { formatValue } from '~/lib/utils';

import { DetailedList, MacroCard, SectionWrapper } from './nutrition-ui';

export default function DishNutritionContent({ data }) {
  const nutrients = data?.nutrients ?? {};
  const vitamins = data?.vitamins ?? [];
  const minerals = data?.minerals ?? [];
  const fats = data?.fats ?? [];
  const sugars = data?.sugars ?? [];
  const calories = nutrients.calories?.value ?? 0;
  const carbs = nutrients.carbs?.value ?? 0;
  const protein = nutrients.protein?.value ?? 0;
  const fat = nutrients.fat?.value ?? 0;

  return (
    <div className='space-y-10'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='relative flex flex-col justify-center overflow-hidden rounded-[2.5rem] bg-primary p-8 text-primary-foreground shadow-xl'>
          <HiOutlineLightningBolt className='absolute -right-2 -top-2 h-24 w-24 text-white/10' />

          <p className='text-[10px] font-black uppercase tracking-[0.2em]'>
            Năng lượng
          </p>

          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-5xl font-black'>{formatValue(calories)}</span>

            <span className='text-lg font-bold opacity-70'>kcal</span>
          </div>
        </div>

        <div className='md:col-span-3 grid grid-cols-3 gap-4'>
          <MacroCard
            label='Tinh bột'
            value={carbs}
            unit='g'
            icon={<FaLeaf size={12} />}
          />

          <MacroCard
            label='Chất đạm'
            value={protein}
            unit='g'
            icon={<HiOutlineScale size={14} />}
          />

          <MacroCard
            label='Chất béo'
            value={fat}
            unit='g'
            icon={<FaWater size={12} />}
          />
        </div>
      </div>

      <div className='grid gap-8 md:grid-cols-2'>
        <SectionWrapper
          title='Vitamin & vi chất'
          icon={<HiOutlineBeaker className='text-primary' />}
          data={vitamins}
        />

        <SectionWrapper
          title='Khoáng chất'
          icon={<HiOutlineScale className='text-primary' />}
          data={minerals}
        />
      </div>

      <div className='rounded-[2rem] bg-card p-8 shadow-sm border border-border'>
        <div className='grid gap-12 md:grid-cols-2'>
          <DetailedList title='Phân rã chất béo' data={fats} />
          <DetailedList title='Đường & chất xơ' data={sugars} />
        </div>
      </div>
    </div>
  );
}
