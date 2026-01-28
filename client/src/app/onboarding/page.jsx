import { Sparkles } from 'lucide-react';
import React from 'react';

import { OnboardingForm } from '~/features/users/complete-onboarding/components/onboarding-form';

const Onboarding = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5'>
      <div className='container mx-auto px-4 py-12'>
        <div className='mb-8 text-center'>
          <h1 className='mb-2 flex items-center justify-center gap-2 text-3xl font-bold tracking-tight md:text-4xl'>
            Chào mừng bạn! <Sparkles className='text-primary' />
          </h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            Hãy hoàn thành những bước sau để chúng tôi có thể tạo ra kế hoạch
            dinh dưỡng phù hợp nhất cho bạn.
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
};

export default Onboarding;
