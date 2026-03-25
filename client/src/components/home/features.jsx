import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
  HiOutlineShoppingBag,
  HiOutlineSparkles
} from 'react-icons/hi2';

const Feature = ({ icon, title, desc, colorClass }) => (
  <div
    className='group bg-card border border-border
               rounded-3xl md:rounded-[2.5rem]
               p-5 sm:p-6 md:p-10
               transition-all duration-300
               md:hover:border-primary/20
               md:hover:shadow-2xl md:hover:shadow-primary/5'
  >
    <div
      className={`
        w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14
        rounded-xl md:rounded-2xl
        flex items-center justify-center
        text-xl sm:text-2xl md:text-3xl
        mb-4 md:mb-8
        transition-transform duration-500
        md:group-hover:rotate-[10deg]
        ${colorClass}
      `}
    >
      {icon}
    </div>

    <h3 className='font-black text-lg sm:text-xl md:text-2xl text-foreground tracking-tight'>
      {title}
    </h3>

    <p className='text-muted-foreground text-sm sm:text-base mt-3 md:mt-4 leading-relaxed'>
      {desc}
    </p>
  </div>
);

const Features = () => {
  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16'>
      <div className='flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6'>
        <div className='max-w-2xl'>
          <div
            className='inline-flex items-center gap-2 px-3 py-1
                          rounded-full text-[10px] sm:text-xs
                          font-bold uppercase tracking-widest
                          text-green-light border mb-3 md:mb-4'
          >
            <HiOutlineSparkles />
            Đặc quyền của bạn
          </div>

          <h2 className='text-2xl sm:text-3xl md:text-5xl font-black text-foreground leading-tight'>
            Tính năng đột phá <br />
            cho <span className='text-primary'>sức khỏe của bạn</span>
          </h2>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8'>
        <Feature
          icon={<HiOutlineAdjustmentsHorizontal />}
          title='Cá nhân hóa'
          desc='Tự động thiết kế thực đơn dựa trên chỉ số cơ thể, mục tiêu cân nặng và sở thích ăn uống riêng.'
          colorClass='text-green-light'
        />

        <Feature
          icon={<HiOutlineArrowPath />}
          title='Đổi món linh hoạt'
          desc='Đổi món trong 1 giây mà vẫn đảm bảo chuẩn lượng Calories và Macro.'
          colorClass='text-cyan-light'
        />

        <Feature
          icon={<HiOutlineShoppingBag />}
          title='Đi chợ thông minh'
          desc='Tổng hợp danh sách nguyên liệu theo tuần giúp tiết kiệm thời gian.'
          colorClass='text-orange-light'
        />
      </div>
    </section>
  );
};

export default Features;
