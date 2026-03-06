import { useEffect } from 'react';
import {
  HiArrowRight,
  HiCheckCircle,
  HiEnvelope,
  HiShieldCheck,
  HiSparkles
} from 'react-icons/hi2';
import { useNavigate, useSearchParams } from 'react-router';

import { useConfirmPayment } from '../../confirm-payment/api/confirm-payment';

const PaymentSuccessView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    mutate: confirmPayment,
    isPending,
    isSuccess,
    isError
  } = useConfirmPayment();

  useEffect(() => {
    const orderCode = searchParams.get('orderCode');
    if (!orderCode) return;

    confirmPayment({ orderCode });
  }, [searchParams, confirmPayment]);

  return (
    <div className='flex justify-center bg-background px-4 pt-24 pb-20 md:pt-28 md:pb-24'>
      <div className='relative bg-card border border-border shadow-2xl rounded-[2.5rem] p-8 md:p-12 text-center max-w-md w-full overflow-hidden'>
        <div className='absolute top-6 right-6 flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider'>
          <HiSparkles className='w-3.5 h-3.5' />
          VIP Active
        </div>

        <div className='mb-8 relative inline-flex items-center justify-center'>
          <div className='relative bg-primary/10 p-5 rounded-full border border-border/60 shadow-sm'>
            <HiCheckCircle className='text-primary text-7xl drop-shadow-sm' />
          </div>
        </div>

        <h1 className='text-3xl font-black text-foreground mb-3 tracking-tight'>
          Thanh toán thành công!
        </h1>

        {isPending && (
          <p className='text-muted-foreground mb-8'>
            Đang xác nhận giao dịch...
          </p>
        )}

        {isSuccess && (
          <p className='text-muted-foreground mb-8'>
            Giao dịch đã được xác nhận. Tài khoản đã được nâng cấp.
          </p>
        )}

        {isError && (
          <p className='text-destructive mb-8'>Xác nhận giao dịch thất bại.</p>
        )}

        <button
          onClick={() => navigate('/')}
          className='w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:opacity-90 transition flex items-center justify-center gap-2 group'
        >
          Trải nghiệm ngay
          <HiArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
        </button>

        <div className='mt-8 flex flex-col items-center gap-2 text-xs text-muted-foreground/70'>
          <div className='flex items-center gap-2'>
            <HiEnvelope className='text-primary w-4 h-4' />
            <span className='font-semibold'>support@eatdee.com</span>
          </div>

          <div className='flex items-center gap-2 text-muted-foreground/60'>
            <HiShieldCheck className='w-4 h-4 text-green-500' />
            <span>Thanh toán bảo mật với PayOS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessView;
