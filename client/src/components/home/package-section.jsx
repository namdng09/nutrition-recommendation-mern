import { HiCheck, HiOutlineSparkles } from 'react-icons/hi2';

const plans = [
  {
    name: 'Cơ bản',
    price: '0đ',
    desc: 'Bắt đầu hành trình sống khỏe',
    features: [
      'Gợi ý món ăn hàng ngày',
      'Theo dõi Calories',
      'Lưu 10 món yêu thích'
    ],
    highlight: false
  },
  {
    name: 'Pro',
    price: '99k',
    period: '/tháng',
    desc: 'Lựa chọn phổ biến nhất',
    features: [
      'AI Meal Plan cá nhân hóa',
      'Shopping list tự động',
      'Đổi món không giới hạn',
      'Theo dõi Macro chi tiết'
    ],
    highlight: true
  },
  {
    name: 'Premium',
    price: '199k',
    period: '/tháng',
    desc: 'Trải nghiệm dinh dưỡng tối thượng',
    features: [
      'Coach AI tư vấn 24/7',
      'Phân tích xu hướng sức khỏe',
      'Kết nối wearable',
      'Hỗ trợ ưu tiên'
    ],
    highlight: false
  }
];

const Card = ({ plan }) => (
  <div
    className={`
      relative rounded-3xl md:rounded-[2.5rem]
      p-5 sm:p-6 md:p-8
      flex flex-col
      border-2 transition-all duration-500
      ${
        plan.highlight
          ? 'bg-card border-primary shadow-xl md:shadow-2xl md:shadow-primary/20 md:scale-105 md:-translate-y-4 z-10'
          : 'bg-card border-border md:hover:border-primary/30'
      }
    `}
  >
    {plan.highlight && (
      <div
        className='absolute -top-3 md:-top-5 left-1/2 -translate-x-1/2
                      bg-primary text-primary-foreground
                      px-3 py-1 rounded-full text-[10px] md:text-xs font-bold
                      flex items-center gap-1 shadow-lg'
      >
        <HiOutlineSparkles />
        PHỔ BIẾN
      </div>
    )}

    <div className='mb-6 md:mb-8'>
      <h3
        className={`text-lg md:text-xl font-black ${
          plan.highlight ? 'text-primary' : 'text-foreground'
        }`}
      >
        {plan.name}
      </h3>

      <p className='text-xs md:text-sm text-muted-foreground mt-1'>
        {plan.desc}
      </p>

      <div className='flex items-baseline gap-1 mt-4 md:mt-6'>
        <span className='text-2xl sm:text-3xl md:text-4xl font-black text-foreground'>
          {plan.price}
        </span>

        {plan.period && (
          <span className='text-xs md:text-sm text-muted-foreground font-medium'>
            {plan.period}
          </span>
        )}
      </div>
    </div>

    <ul className='flex-1 space-y-3 md:space-y-4 mb-6 md:mb-8'>
      {plan.features.map(f => (
        <li
          key={f}
          className='flex items-start gap-2 md:gap-3 text-xs sm:text-sm font-medium text-foreground/80'
        >
          <div
            className={`mt-0.5 ${
              plan.highlight ? 'text-primary' : 'text-green-600'
            }`}
          >
            <HiCheck strokeWidth={3} />
          </div>
          {f}
        </li>
      ))}
    </ul>

    <button
      className={`
        w-full py-3 md:py-4
        rounded-xl md:rounded-2xl
        text-sm md:text-base
        font-black
        transition-all active:scale-95
        ${
          plan.highlight
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90'
            : 'bg-secondary text-secondary-foreground hover:bg-muted border border-border'
        }
      `}
    >
      Bắt đầu ngay
    </button>
  </div>
);

const PackagesSection = () => {
  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 bg-background'>
      <div className='text-center max-w-2xl mx-auto mb-8 md:mb-16'>
        <h2 className='text-2xl sm:text-3xl md:text-5xl font-black text-foreground tracking-tight'>
          Đầu tư cho <span className='text-primary'>sức khỏe</span>
        </h2>

        <p className='text-sm sm:text-base md:text-lg text-muted-foreground mt-3 md:mt-4'>
          Chọn gói phù hợp với mục tiêu của bạn. Nâng cấp hoặc hủy bất cứ lúc
          nào.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-stretch'>
        {plans.map(p => (
          <Card key={p.name} plan={p} />
        ))}
      </div>

      <p className='text-center mt-8 md:mt-12 text-xs sm:text-sm text-muted-foreground'>
        Bạn có thắc mắc?{' '}
        <span className='text-primary font-bold cursor-pointer underline underline-offset-4'>
          Liên hệ đội ngũ chuyên gia
        </span>
      </p>
    </section>
  );
};

export default PackagesSection;
