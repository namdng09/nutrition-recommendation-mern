import { CheckCircle2, Home } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router';

import { Button } from '~/components/ui/button';

export function StepFourSuccess() {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center py-10 text-center space-y-8 animate-in fade-in zoom-in duration-500'>
      <div>
        <CheckCircle2 className='size-24 text-green-500' />
      </div>

      <div className='space-y-4 max-w-md'>
        <h3 className='text-3xl font-bold tracking-tight'>
          Thiết lập thành công!
        </h3>
        <p className='text-muted-foreground text-lg'>
          Hồ sơ của bạn đã được cập nhật. Chúng tôi đã sẵn sàng đưa ra những gợi
          ý dinh dưỡng tốt nhất cho bạn.
        </p>
      </div>

      <Button size='lg' onClick={() => navigate('/')} className='gap-2'>
        <Home className='size-5' />
        Về trang chủ
      </Button>
    </div>
  );
}
