import { Sparkles } from 'lucide-react';
import React from 'react';

import { OnboardingForm } from '~/features/users/complete-onboarding/components/onboarding-form';

const Onboarding = () => {
  return (
    <div className='w-full max-w-5xl mx-auto px-4 py-4 flex-1'>
      <OnboardingForm />
    </div>
  );
};

export default Onboarding;
