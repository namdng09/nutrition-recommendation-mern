import NutritionPiePreview from './nutrition-pie-preview';

function NutritionSummary({ nutrition }) {
  const keyNutrients = [
    'Năng lượng',
    'Protein',
    'Chất béo',
    'Tinh bột',
    'Chất xơ'
  ];

  const summaryItems = keyNutrients
    .map(label => nutrition?.nutrients?.find(item => item.label === label))
    .filter(Boolean);

  if (!summaryItems.length) return null;

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5'>
      {summaryItems.map(item => (
        <div
          key={`${item.label}-${item.unit}`}
          className='rounded-[24px] border border-border/80 bg-card px-5 py-4 text-card-foreground shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]'
        >
          <p className='text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground'>
            {item.label}
          </p>

          <div className='mt-4 flex items-end justify-between gap-3'>
            <p className='text-2xl font-black leading-none text-foreground'>
              {item.value}
            </p>
            <span className='rounded-full bg-accent px-3 py-1 text-xs font-bold text-muted-foreground'>
              {item.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CreatePrivateDishNutritionEstimate({
  SectionCard,
  nutrition
}) {
  return (
    <SectionCard
      title='Dinh dưỡng ước tính'
      description='Thông tin này được tự động tính từ các nguyên liệu đã chọn.'
    >
      <div className='space-y-5'>
        <div className='xl:hidden overflow-hidden rounded-[28px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'>
          <NutritionPiePreview nutrition={nutrition} />
        </div>

        <div className='hidden xl:block'>
          <NutritionSummary nutrition={nutrition} />
        </div>
      </div>
    </SectionCard>
  );
}
