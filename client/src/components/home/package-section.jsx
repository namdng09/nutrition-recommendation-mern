import PackagesGrid from '~/features/payment/create-payment/components/packages-grid';

const PackagesSection = () => {
  return (
    <section
      id='packages'
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 bg-background'
    >
      <div className='text-center max-w-2xl mx-auto mb-8 md:mb-16'>
        <h2 className='text-2xl sm:text-3xl md:text-5xl font-black text-foreground tracking-tight'>
          Đầu tư cho <span className='text-primary'>sức khỏe</span>
        </h2>

        <p className='text-sm sm:text-base md:text-lg text-muted-foreground mt-3 md:mt-4'>
          Chọn gói phù hợp với mục tiêu của bạn. Nâng cấp hoặc hủy bất cứ lúc
          nào.
        </p>
      </div>

      <PackagesGrid />
    </section>
  );
};

export default PackagesSection;
