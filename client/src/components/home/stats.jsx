import {
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineFire
} from 'react-icons/hi2';

const Item = ({ icon, label, value, colorClass }) => (
  <div
    className='group bg-card border border-border rounded-3xl md:rounded-[2.5rem]
                  p-5 sm:p-6 md:p-8
                  transition-all duration-300
                  md:hover:shadow-2xl md:hover:shadow-primary/5 md:hover:-translate-y-2'
  >
    <div className='flex flex-col items-center text-center gap-3 md:gap-4'>
      <div
        className={`
          w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
          rounded-xl md:rounded-2xl
          flex items-center justify-center
          text-xl sm:text-2xl md:text-3xl
          ${colorClass}
        `}
      >
        {icon}
      </div>

      <div>
        <div className='text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight'>
          {value}
        </div>

        <div className='text-[10px] sm:text-xs md:text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest'>
          {label}
        </div>
      </div>
    </div>
  </div>
);

const Stats = () => {
  return (
    <section className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8'>
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
