import {
  HiOutlineArrowRight,
  HiOutlineChartBar,
  HiOutlineCheckBadge,
  HiSparkles
} from 'react-icons/hi2';

import food from '../../../public/food.webp';

const Hero = () => {
  return (
    <section className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-10 md:gap-16 items-center bg-background overflow-hidden'>
      <div className='relative z-10 order-2 md:order-1'>
        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-6 border text-green-light shadow-sm'>
          <HiSparkles className='animate-pulse' />
          Cá nhân hóa bởi AI
        </div>

        <h1 className='text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-foreground'>
          Ăn <span className='text-primary'>thông minh</span>
          <br />
          Sống khỏe hơn
        </h1>

        <p className='mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg'>
          EatDee giúp bạn thiết kế thực đơn khoa học, theo dõi dinh dưỡng và đạt
          mục tiêu cân nặng chỉ với vài bước chạm.
        </p>

        <div className='mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4'>
          <button className='group flex justify-center items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition'>
            Bắt đầu miễn phí
            <HiOutlineArrowRight className='group-hover:translate-x-1 transition-transform' />
          </button>

          <button className='flex justify-center items-center gap-2 bg-secondary text-secondary-foreground font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl border border-border hover:bg-muted transition'>
            Xem cách hoạt động
          </button>
        </div>

        <div className='mt-8 flex flex-wrap gap-4 text-xs sm:text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <HiOutlineCheckBadge className='text-primary text-lg' />
            Kế hoạch khoa học
          </div>

          <div className='flex items-center gap-2'>
            <HiOutlineChartBar className='text-primary text-lg' />
            Báo cáo chi tiết
          </div>
        </div>
      </div>

      <div className='relative order-1 md:order-2'>
        <div className='absolute -inset-6 md:-inset-10 bg-accent/50 blur-[80px] md:blur-[100px] rounded-full' />

        <div className='relative'>
          <img
            src={food}
            alt='EatDee Healthy Meal'
            className='relative z-10 rounded-3xl md:rounded-[3rem] shadow-2xl shadow-primary/10 object-cover w-full h-auto border-8 md:border-[12px] border-card'
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
