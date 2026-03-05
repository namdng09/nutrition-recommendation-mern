import { useCreatePayment } from '../api/create-payment';
import PackageCard from './package-card';

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
    highlight: false,
    amount: 0,
    targetMembership: 'NORMAL'
  },
  {
    name: 'VIP',
    price: '99k',
    period: '/tháng',
    desc: 'Lựa chọn phổ biến nhất',
    features: [
      'AI Meal Plan cá nhân hóa',
      'Shopping list tự động',
      'Đổi món không giới hạn',
      'Theo dõi Macro chi tiết'
    ],
    highlight: true,
    amount: 99000,
    targetMembership: 'Tài khoản VIP'
  }
];

const PackagesGrid = () => {
  const { mutateAsync, isPending } = useCreatePayment();
  const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || window.location.origin;

  const handleSelectPlan = async plan => {
    if (!plan.amount || plan.amount <= 0) return;

    try {
      const result = await mutateAsync({
        amount: plan.amount,
        description: `Thanh toán gói ${plan.name}`,
        returnUrl: `${CLIENT_URL}/payment/success`,
        cancelUrl: `${CLIENT_URL}/payment/cancel`,
        targetMembership: plan.targetMembership
      });

      const checkoutUrl =
        typeof result === 'string' ? result : result?.checkoutUrl;

      if (!checkoutUrl) {
        console.log('CreatePayment result:', result);
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('CreatePayment error:', err?.response?.data || err);
    }
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-stretch max-w-3xl mx-auto'>
      {plans.map(plan => (
        <PackageCard
          key={plan.name}
          plan={plan}
          onSelect={handleSelectPlan}
          isLoading={isPending}
        />
      ))}
    </div>
  );
};

export default PackagesGrid;
