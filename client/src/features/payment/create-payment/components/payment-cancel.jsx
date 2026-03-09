import { useEffect } from 'react';
import { HiArrowLeft, HiLockClosed, HiXCircle } from 'react-icons/hi2';
import { useNavigate, useSearchParams } from 'react-router';

import { useConfirmPayment } from '../../confirm-payment/api/confirm-payment';

const PaymentCancel = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { mutate: confirmPayment } = useConfirmPayment();

  useEffect(() => {
    const orderCode = searchParams.get('orderCode');
    if (!orderCode) return;

    confirmPayment({ orderCode });
  }, [searchParams, confirmPayment]);

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-background'>
      <div className='w-full max-w-md'>
        <div className='bg-card border border-border rounded-3xl p-10 text-center shadow-xl transition-all'>
          <div className='relative w-24 h-24 mx-auto mb-8'>
            <div className='absolute inset-0 bg-destructive/20 blur-2xl rounded-full animate-pulse' />

            <div className='relative flex items-center justify-center h-full w-full bg-background border border-border rounded-full'>
              <HiXCircle className='text-destructive text-6xl' />
            </div>
          </div>

          <h1 className='text-3xl font-black text-foreground mb-3'>
            Thanh toán bị hủy
          </h1>

          <p className='text-muted-foreground mb-8 leading-relaxed'>
            Giao dịch chưa được hoàn tất. Bạn có thể thử lại bất cứ lúc nào.
          </p>

          <div className='space-y-4'>
            <button
              onClick={() => navigate('/#packages')}
              className='w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition active:scale-[0.98]'
            >
              Thử lại
            </button>

            <button
              onClick={() => navigate('/')}
              className='flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition font-semibold'
            >
              <HiArrowLeft className='text-lg' />
              Quay về trang chủ
            </button>
          </div>
        </div>

        <div className='mt-8 text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-xs text-muted-foreground font-semibold'>
            <HiLockClosed className='text-primary text-sm' />
            Thanh toán an toàn với PayOS
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
