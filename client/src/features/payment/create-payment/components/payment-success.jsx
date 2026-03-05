import {
  HiArrowRight,
  HiCheckCircle,
  HiDocumentText,
  HiEnvelope,
  HiShieldCheck,
  HiSparkles
} from 'react-icons/hi2';
import { useNavigate } from 'react-router';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className='flex justify-center bg-background px-4 pt-24 pb-16 md:pb-20'>
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]' />
        <div className='absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]' />
      </div>
      <div className='relative bg-card border border-border shadow-2xl rounded-[2.5rem] p-8 md:p-12 text-center max-w-md w-full overflow-hidden'>
        <div className='absolute top-6 right-6 flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider'>
          <HiSparkles className='w-3.5 h-3.5' />
          VIP Active
        </div>

        <div className='relative z-10'>
          <div className='mb-8 relative inline-flex items-center justify-center'>
            <div className='absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20' />
            <div className='relative bg-primary/10 p-5 rounded-full border border-border/60 shadow-sm'>
              <HiCheckCircle className='text-primary text-7xl drop-shadow-sm' />
            </div>
          </div>

          <h1 className='text-3xl font-black text-foreground mb-3 tracking-tight'>
            Thanh toán thành công!
          </h1>

          <p className='text-muted-foreground mb-10 leading-relaxed'>
            Cảm ơn bạn đã đồng hành cùng{' '}
            <span className='text-primary font-black'>EatDee</span>. Tài khoản
            của bạn đã được nâng cấp lên hạng{' '}
            <span className='font-black underline decoration-primary/30 underline-offset-4'>
              VIP
            </span>
            .
          </p>

          <div className='space-y-3'>
            <button
              onClick={() => navigate('/')}
              className='w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group'
            >
              Trải nghiệm ngay
              <HiArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
            </button>
          </div>

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
    </div>
  );
};

export default PaymentSuccess;
