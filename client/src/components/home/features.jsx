import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
  HiOutlineShoppingBag
} from 'react-icons/hi2';

const Feature = ({ icon, title, desc, colorClass }) => (
  <div className='group relative overflow-hidden rounded-[24px] border border-border/70 bg-card/90 p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:p-5 md:p-6'>
    <div
      className={`
        flex h-11 w-11 items-center justify-center
        rounded-xl border border-border/60 bg-muted/50
        text-xl shadow-sm transition-transform duration-200
        group-hover:scale-[1.02]
        md:h-12 md:w-12 md:text-[1.35rem]
        ${colorClass}
      `}
    >
      {icon}
    </div>

    <div className='mt-4 space-y-2'>
      <h3 className='text-base font-bold tracking-tight text-foreground sm:text-lg'>
        {title}
      </h3>

      <p className='text-sm leading-6 text-muted-foreground'>{desc}</p>
    </div>
  </div>
);

const Features = () => {
  return (
    <section className='mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6'>
        <Feature
          icon={<HiOutlineAdjustmentsHorizontal />}
          title='Cá nhân hóa'
          desc='Tự động thiết kế thực đơn dựa trên chỉ số cơ thể, mục tiêu cân nặng và sở thích ăn uống riêng.'
          colorClass='text-emerald-500'
        />

        <Feature
          icon={<HiOutlineArrowPath />}
          title='Đổi món linh hoạt'
          desc='Đổi món trong 1 giây mà vẫn đảm bảo chuẩn lượng Calories và Macro.'
          colorClass='text-sky-500'
        />

        <Feature
          icon={<HiOutlineShoppingBag />}
          title='Đi chợ thông minh'
          desc='Tổng hợp danh sách nguyên liệu theo tuần giúp tiết kiệm thời gian.'
          colorClass='text-orange-500'
        />
      </div>
    </section>
  );
};

export default Features;
