import { FaFire, FaLeaf, FaRegEdit, FaUtensils } from 'react-icons/fa';

function MiniStat({ icon, label, value }) {
  return (
    <div className='rounded-[22px] border border-border bg-card px-4 py-4 text-card-foreground shadow-[0_10px_24px_rgba(15,23,42,0.07)]'>
      <div className='mb-3 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          {icon}
        </div>

        <span className='text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground'>
          {label}
        </span>
      </div>

      <p className='text-[34px] font-black leading-none tracking-tight text-foreground'>
        {value}
      </p>
    </div>
  );
}

export default function CreatePrivateDishHeader({
  ingredientCount,
  stepCount,
  servings
}) {
  return (
    <section className='relative overflow-hidden rounded-[36px] border border-border bg-card shadow-[0_18px_48px_rgba(15,23,42,0.07)]'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_20%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_20%)]' />

      <div className='relative px-6 py-7 sm:px-8 sm:py-9 xl:px-10 xl:py-10'>
        <div className='grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-center'>
          <div className='max-w-3xl'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              <div className='flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#34d399_0%,#10b981_55%,#059669_100%)] text-white shadow-[0_14px_28px_rgba(16,185,129,0.20)]'>
                <FaUtensils className='text-[22px]' />
              </div>

              <div>
                <h1 className='text-[24px] font-black leading-[1.15] tracking-tight text-foreground sm:text-[34px] xl:text-[32px]'>
                  Bắt đầu tạo{' '}
                  <span className='text-primary'>món ăn của riêng bạn</span>
                </h1>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <MiniStat
              icon={<FaLeaf className='text-sm' />}
              label='Nguyên liệu'
              value={ingredientCount}
            />
            <MiniStat
              icon={<FaRegEdit className='text-sm' />}
              label='Các bước'
              value={stepCount}
            />
            <MiniStat
              icon={<FaFire className='text-sm' />}
              label='Khẩu phần'
              value={servings}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
