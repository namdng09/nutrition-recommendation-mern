import { ChefHat, Salad, User } from 'lucide-react';
import React from 'react';

export function StepZeroIntro() {
  return (
    <div className='space-y-6 max-w-2xl mx-auto pt-4'>
      <title>Chào mừng</title>
      <meta
        name='description'
        content='Chào mừng bạn đến với website Eatdee. Bắt đầu hành trình sức khỏe của bạn.'
      />
      <div className='space-y-2 text-center sm:text-left'>
        <h3 className='text-3xl font-bold'>Thiết lập tài khoản của bạn</h3>
        <p className='text-muted-foreground text-lg'>
          Hãy bắt đầu thiết lập tài khoản của bạn! Chúng tôi cần biết một chút
          về bạn để đưa ra những gợi ý món ăn phù hợp nhất.
        </p>
      </div>

      <div className='bg-card rounded-xl border p-4 space-y-4 shadow-sm'>
        <div className='flex items-start gap-4'>
          <div className='bg-primary/10 p-3 rounded-xl'>
            <Salad className='size-8 text-primary' />
          </div>
          <div className='space-y-1'>
            <h4 className='font-semibold text-xl'>1. Chế độ ăn của bạn</h4>
            <p className='text-muted-foreground'>
              Nhập các hạn chế về chế độ ăn uống hoặc dị ứng của bạn để chúng
              tôi có thể lọc thực phẩm phù hợp.
            </p>
          </div>
        </div>

        <div className='w-full h-px bg-border' />

        <div className='flex items-start gap-4'>
          <div className='bg-primary/10 p-3 rounded-xl'>
            <User className='size-8 text-primary' />
          </div>
          <div className='space-y-1'>
            <h4 className='font-semibold text-xl'>2. Về bạn</h4>
            <p className='text-muted-foreground'>
              Chiều cao, cân nặng và mục tiêu tương lai của bạn để tính toán nhu
              cầu dinh dưỡng.
            </p>
          </div>
        </div>

        <div className='w-full h-px bg-border' />

        <div className='flex items-start gap-4'>
          <div className='bg-primary/10 p-3 rounded-xl'>
            <ChefHat className='size-8 text-primary' />
          </div>
          <div className='space-y-1'>
            <h4 className='font-semibold text-xl'>3. Bữa ăn của bạn</h4>
            <p className='text-muted-foreground'>
              Cấu trúc các bữa ăn trong ngày và các món ăn yêu thích của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
