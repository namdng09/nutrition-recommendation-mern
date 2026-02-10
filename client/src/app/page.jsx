import Features from '~/components/home/features';
import Hero from '~/components/home/hero';
import PackagesSection from '~/components/home/package-section';
import Stats from '~/components/home/stats';

const Page = () => {
  return (
    <div className='bg-background text-foreground'>
      <Hero />
      <Stats />
      <Features />
      <PackagesSection />
    </div>
  );
};

export default Page;
