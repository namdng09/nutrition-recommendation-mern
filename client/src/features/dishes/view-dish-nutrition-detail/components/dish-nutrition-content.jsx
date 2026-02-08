import { FaLeaf, FaWater } from 'react-icons/fa';
import {
  HiOutlineBeaker,
  HiOutlineLightningBolt,
  HiOutlineScale
} from 'react-icons/hi';

import { formatGram } from '~/lib/utils';

export default function DishNutritionContent({ data }) {
  const {
    nutrients = {},
    vitamins = [],
    minerals = [],
    fats = [],
    sugars = []
  } = data;

  return (
    <div className='space-y-10'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='relative flex flex-col justify-center overflow-hidden rounded-[2.5rem] bg-primary p-8 text-primary-foreground shadow-xl'>
          <HiOutlineLightningBolt className='absolute -right-2 -top-2 h-24 w-24 text-white/10' />
          <p className='text-[10px] font-black uppercase tracking-[0.2em]'>
            Năng lượng
          </p>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-5xl font-black'>
              {formatGram(nutrients?.calories?.value)}
            </span>
            <span className='text-lg font-bold opacity-70'>kcal</span>
          </div>
        </div>

        <div className='md:col-span-3 grid grid-cols-3 gap-4'>
          <MacroCard
            label='Tinh bột'
            value={nutrients?.carbs?.value}
            icon={<FaLeaf size={12} />}
          />
          <MacroCard
            label='Chất đạm'
            value={nutrients?.protein?.value}
            icon={<HiOutlineScale size={14} />}
          />
          <MacroCard
            label='Chất béo'
            value={nutrients?.fat?.value}
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

function MacroCard({ label, value, icon }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-[2.5rem] border border-border bg-card p-6 shadow-sm hover:scale-105 transition'>
      <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary shadow'>
        {icon}
      </div>
      <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
        {label}
      </p>
      <div className='mt-1 flex items-baseline gap-1'>
        <span className='text-2xl font-black'>{formatGram(value)}</span>
        <span className='text-xs font-bold text-muted-foreground'>g</span>
      </div>
    </div>
  );
}

function SectionWrapper({ title, icon, data }) {
  if (!data?.length) return null;
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 px-2'>
        <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary shadow'>
          {icon}
        </span>
        <h2 className='text-sm font-black uppercase tracking-widest text-muted-foreground'>
          {title}
        </h2>
      </div>
      <div className='grid gap-3'>
        {data.map(item => (
          <div
            key={item.label}
            className='flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border hover:border-primary/30'
          >
            <span className='text-sm font-medium text-muted-foreground'>
              {item.label}
            </span>
            <div className='flex items-baseline gap-1'>
              <span className='font-black'>{formatGram(item.value)}</span>
              <span className='text-[10px] font-bold uppercase text-muted-foreground'>
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailedList({ title, data }) {
  if (!data?.length) return null;
  return (
    <div className='space-y-4'>
      <h3 className='text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2'>
        {title}
      </h3>
      <div className='space-y-3'>
        {data.map(item => (
          <div
            key={item.label}
            className='flex items-center justify-between text-sm'
          >
            <span className='font-medium text-muted-foreground italic'>
              {item.label}
            </span>
            <div className='flex-1 mx-4 h-px bg-border' />
            <span className='font-black'>
              {formatGram(item.value)}
              <small className='ml-0.5 text-muted-foreground'>
                {item.unit}
              </small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
