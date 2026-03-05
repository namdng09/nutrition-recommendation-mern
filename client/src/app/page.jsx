import { useEffect } from 'react';
import { useLocation } from 'react-router';

import Features from '~/components/home/features';
import Hero from '~/components/home/hero';
import PackagesSection from '~/components/home/package-section';
import Stats from '~/components/home/stats';

const Page = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [hash]);

  return (
    <div className='bg-background text-foreground scroll-smooth'>
      <Hero />
      <Stats />
      <Features />
      <PackagesSection />
    </div>
  );
};

export default Page;
