import {
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineFire
} from 'react-icons/hi2';

const Item = ({ icon, label, value, colorClass }) => (
  <div className='group relative overflow-hidden rounded-[2rem] bg-card p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] sm:p-6 md:rounded-[2.5rem] md:p-8'>
    <div className='absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />

    <div className='flex flex-col items-center gap-4 text-center md:gap-5'>
      <div
        className={`
          flex h-14 w-14 items-center justify-center
          rounded-2xl bg-muted/60 text-2xl
          shadow-sm ring-1 ring-border/40
          transition-transform duration-300 group-hover:scale-105
          sm:h-16 sm:w-16 sm:text-3xl
          md:h-[4.5rem] md:w-[4.5rem] md:text-[2rem]
          ${colorClass}
        `}
      >
        {icon}
      </div>

      <div className='space-y-1.5'>
        <div className='text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-[2rem]'>
          {value}
        </div>

        <div className='text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground sm:text-xs md:text-sm'>
          {label}
        </div>
      </div>
    </div>
  </div>
);

const Stats = () => {
  return (
    <section className='relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8'>
      <div className='absolute inset-x-0 top-1/2 -z-10 mx-auto hidden h-40 max-w-5xl -translate-y-1/2 rounded-full bg-primary/5 blur-3xl md:block' />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8'>
        <Item
          icon={<HiOutlineFire />}
          value='500+'
          label='Thực đơn khoa học'
          colorClass='text-orange-light'
        />

        <Item
          icon={<HiOutlineClock />}
          value='< 30 giây'
          label='Tạo kế hoạch nhanh'
          colorClass='text-cyan-light'
        />

        <Item
          icon={<HiOutlineChartBar />}
          value='Chính xác'
          label='Theo dõi dinh dưỡng'
          colorClass='text-green-light'
        />
      </div>
    </section>
  );
};

export default Stats;
