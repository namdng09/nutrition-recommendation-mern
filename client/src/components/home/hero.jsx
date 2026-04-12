import {
  HiOutlineArrowRight,
  HiOutlineChartBar,
  HiOutlineCheckBadge
} from 'react-icons/hi2';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

const Hero = () => {
  const user = useSelector(state => state.auth.user);
  return (
    <section className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-10 md:gap-16 items-center bg-background overflow-hidden'>
      <div className='relative z-10 order-2 md:order-1'>
        <div className='inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary shadow-sm'>
          <HiOutlineCheckBadge className='text-base' />
          EatDee đồng hành cùng mục tiêu sức khỏe của bạn
        </div>

        <h1 className='mt-5 text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl'>
          Ăn <span className='text-primary'>thông minh</span>
          <br />
          <span className='text-foreground'>Sống khỏe mạnh</span>
        </h1>

        <p className='mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg'>
          EatDee giúp bạn thiết kế thực đơn khoa học, theo dõi dinh dưỡng và đạt
          mục tiêu cân nặng với trải nghiệm đơn giản, trực quan và dễ duy trì
          mỗi ngày.
        </p>

        <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4'>
          <Link
            to={user ? '/schedules/day' : '/auth/login'}
            className='group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[0_12px_28px_rgba(59,130,246,0.22)] transition-all duration-200 hover:opacity-95 sm:h-14 sm:px-8 sm:text-base'
          >
            Bắt đầu miễn phí
            <HiOutlineArrowRight className='text-lg transition-transform duration-200 group-hover:translate-x-1' />
          </Link>

          <a
            href='https://www.youtube.com/watch?v=7uLCm3g_CLM'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 text-sm font-bold text-foreground shadow-sm transition-colors duration-200 hover:bg-accent sm:h-14 sm:px-8 sm:text-base'
          >
            Xem cách hoạt động
          </a>
        </div>

        <div className='mt-8 flex flex-wrap gap-3 sm:gap-4'>
          <div className='inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground sm:text-sm'>
            <HiOutlineCheckBadge className='text-lg text-primary' />
            Kế hoạch khoa học
          </div>

          <div className='inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground sm:text-sm'>
            <HiOutlineChartBar className='text-lg text-primary' />
            Báo cáo chi tiết
          </div>
        </div>
      </div>

      <div className='relative order-1 md:order-2'>
        <div className='absolute -inset-6 md:-inset-10 bg-accent/50 blur-[80px] md:blur-[100px] rounded-full' />

        <div className='relative'>
          <img
            src='/food.png'
            alt='EatDee Healthy Meal'
            className='relative z-10
           rounded-3xl md:rounded-[3rem]
           shadow-2xl shadow-primary/10
           object-cover
           w-full h-auto
           border-4 md:border-6 border-card'
          />

          <div className='absolute -bottom-5 -left-2 md:-bottom-8 md:-left-8 z-20 bg-card p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl border border-border flex items-center gap-3 animate-bounce-slow'>
            <div className='w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary'>
              <HiOutlineChartBar size={20} />
            </div>

            <div>
              <p className='text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest'>
                Protein Goal
              </p>

              <p className='text-sm md:text-lg font-black text-foreground'>
                120g / 150g
              </p>

              <div className='w-20 md:w-24 h-1.5 bg-secondary rounded-full mt-1'>
                <div className='w-4/5 h-full bg-primary rounded-full' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
