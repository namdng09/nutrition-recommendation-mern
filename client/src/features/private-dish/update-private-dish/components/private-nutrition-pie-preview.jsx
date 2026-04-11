import { useMemo } from 'react';
import {
  FaChartPie,
  FaDrumstickBite,
  FaEllipsisH,
  FaFireAlt
} from 'react-icons/fa';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const getNutrientValue = (nutrition, label) => {
  return nutrition?.nutrients?.find(item => item.label === label);
};

const roundNumber = value => Math.round((value + Number.EPSILON) * 100) / 100;

const formatGram = value => roundNumber(Number(value || 0));

const getOtherNutrition = nutrients => {
  const fat = Number(nutrients.fat?.value || 0);
  const carbs = Number(nutrients.carbs?.value || 0);
  const fiber = Number(nutrients.fiber?.value || 0);
  return roundNumber(fat + carbs + fiber);
};

const buildNutritionPieData = nutrients => {
  return [
    {
      name: 'Protein',
      value: Number(nutrients.protein?.value || 0),
      color: '#10b981'
    },
    {
      name: 'Chất béo',
      value: Number(nutrients.fat?.value || 0),
      color: '#f59e0b'
    },
    {
      name: 'Tinh bột',
      value: Number(nutrients.carbs?.value || 0),
      color: '#3b82f6'
    },
    {
      name: 'Chất xơ',
      value: Number(nutrients.fiber?.value || 0),
      color: '#8b5cf6'
    }
  ].filter(item => item.value > 0);
};

export default function PrivateNutritionPiePreview({ nutrition }) {
  const list = nutrition?.nutrients || [];

  const nutrients = {
    protein: getNutrientValue({ nutrients: list }, 'Protein'),
    fat: getNutrientValue({ nutrients: list }, 'Chất béo'),
    carbs: getNutrientValue({ nutrients: list }, 'Tinh bột'),
    fiber: getNutrientValue({ nutrients: list }, 'Chất xơ'),
    calories: getNutrientValue({ nutrients: list }, 'Năng lượng')
  };

  const data = useMemo(() => buildNutritionPieData(nutrients), [nutrients]);
  const chartData = data.length
    ? data
    : [{ name: 'Trống', value: 1, color: '#e5e7eb' }];

  const totalGram = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className='sticky top-6 overflow-hidden rounded-[36px] border border-border bg-card p-5 text-card-foreground shadow-[0_8px_30px_rgba(15,23,42,0.06)] xl:p-6'>
      <div className='mb-6 flex items-start justify-between gap-4'>
        <div className='flex min-w-0 items-center gap-4'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <FaChartPie size={20} />
          </div>
          <div className='min-w-0'>
            <h3 className='text-base font-black uppercase tracking-[0.14em] text-foreground'>
              Dinh dưỡng ước tính
            </h3>
            <p className='text-sm leading-6 text-muted-foreground'>
              Tự động tính từ nguyên liệu
            </p>
          </div>
        </div>

        <span className='shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground'>
          gram / kcal
        </span>
      </div>

      <div className='relative h-[300px] w-full sm:h-[320px] xl:h-[420px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='46%'
              innerRadius={72}
              outerRadius={108}
              paddingAngle={7}
              cornerRadius={12}
              stroke='none'
            >
              {chartData.map(entry => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={value => `${formatGram(value)} g`}
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
              }}
            />

            {data.length > 0 ? (
              <Legend
                verticalAlign='bottom'
                iconType='circle'
                iconSize={9}
                wrapperStyle={{
                  paddingTop: '10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  lineHeight: '20px'
                }}
              />
            ) : null}
          </PieChart>
        </ResponsiveContainer>

        <div className='pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-center'>
          <p className='text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground'>
            Tổng chất
          </p>
          <p className='text-2xl font-black tracking-tight text-foreground sm:text-3xl'>
            {formatGram(totalGram)}
            <span className='ml-1 text-[11px] text-muted-foreground'>g</span>
          </p>
        </div>
      </div>

      <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3'>
        <div className='min-w-0 rounded-[24px] border border-orange-500/20 bg-orange-500/10 p-4 text-center'>
          <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-300'>
            <FaFireAlt size={17} />
          </div>
          <p className='text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground'>
            Calo
          </p>
          <p className='mt-1 break-words text-[20px] font-black leading-none tracking-tight text-foreground'>
            {nutrients.calories?.value ?? 0}
            <span className='ml-1 text-[12px] text-muted-foreground'>kcal</span>
          </p>
        </div>

        <div className='min-w-0 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-center'>
          <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'>
            <FaDrumstickBite size={17} />
          </div>
          <p className='text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground'>
            Đạm
          </p>
          <p className='mt-1 break-words text-[20px] font-black leading-none tracking-tight text-foreground'>
            {formatGram(nutrients.protein?.value)}
            <span className='ml-1 text-[12px] text-muted-foreground'>g</span>
          </p>
        </div>

        <div className='min-w-0 rounded-[24px] border border-sky-500/20 bg-sky-500/10 p-4 text-center'>
          <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-300'>
            <FaEllipsisH size={17} />
          </div>
          <p className='text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground'>
            Khác
          </p>
          <p className='mt-1 break-words text-[20px] font-black leading-none tracking-tight text-foreground'>
            {getOtherNutrition(nutrients)}
            <span className='ml-1 text-[12px] text-muted-foreground'>g</span>
          </p>
        </div>
      </div>
    </div>
  );
}
