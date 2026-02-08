import { Outlet } from 'react-router';

import OnboardingHeader from '~/components/onboarding-header';

const OnboardingLayout = () => {
  return (
    <div className='flex min-h-screen flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-x-hidden'>
      <OnboardingHeader />
      <main className='flex-1 flex flex-col'>
        <Outlet />
      </main>
    </div>
  );
};

export default OnboardingLayout;
