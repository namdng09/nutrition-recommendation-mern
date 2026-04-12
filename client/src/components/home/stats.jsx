import {
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineFire
} from 'react-icons/hi2';

const Item = ({ icon, label, value, tone = 'orange' }) => {
  const toneMap = {
    orange: {
      icon: 'text-orange-500 bg-orange-500/10',
      glow: 'bg-orange-500/10',
      line: 'bg-orange-500/70'
    },
    sky: {
      icon: 'text-sky-500 bg-sky-500/10',
      glow: 'bg-sky-500/10',
      line: 'bg-sky-500/70'
    },
    emerald: {
      icon: 'text-emerald-500 bg-emerald-500/10',
      glow: 'bg-emerald-500/10',
      line: 'bg-emerald-500/70'
    }
  };

  return (
    <div className='group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.07)] sm:p-7 md:rounded-[2.5rem] md:p-8'>
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl opacity-60 transition-opacity duration-200 group-hover:opacity-70 ${toneMap[tone].glow}`}
      />
      <div className='relative'>
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[1.35rem] text-[1.8rem] ring-1 ring-border/50 shadow-sm transition-transform duration-200 group-hover:scale-[1.02] md:h-[4.5rem] md:w-[4.5rem] md:text-[2rem] ${toneMap[tone].icon}`}
        >
          {icon}
        </div>

        <div className='mt-7'>
          <p className='text-3xl font-black leading-none tracking-tight text-foreground sm:text-[2rem] md:text-[2.3rem]'>
            {value}
          </p>

          <div
            className={`mt-4 h-1.5 w-12 rounded-full ${toneMap[tone].line}`}
          />

          <p className='mt-4 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground sm:text-sm'>
            {label}
          </p>
        </div>
      </div>
    </div>
  );
};

const Stats = () => {
  return (
    <section className='relative mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8'>
      <div className='mb-10 text-center'>
        <span className='inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold text-primary'>
          Tính năng nổi bật
        </span>

        <h2 className='mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl'>
          Xây thực đơn nhanh, theo dõi dinh dưỡng rõ ràng
        </h2>

        <p className='mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base'>
          Từ lập kế hoạch bữa ăn đến theo dõi chỉ số dinh dưỡng, mọi thứ đều
          được thiết kế để trực quan, nhanh và dễ duy trì mỗi ngày.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8'>
        <Item
          icon={<HiOutlineFire />}
          value='500+'
          label='Thực đơn khoa học'
          tone='orange'
        />

        <Item
          icon={<HiOutlineClock />}
          value='< 30 giây'
          label='Tạo kế hoạch nhanh'
          tone='sky'
        />

        <Item
          icon={<HiOutlineChartBar />}
          value='Chính xác'
          label='Theo dõi dinh dưỡng'
          tone='emerald'
        />
      </div>
    </section>
  );
};

export default Stats;
