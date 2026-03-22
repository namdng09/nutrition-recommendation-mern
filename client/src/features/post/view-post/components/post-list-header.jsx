import { HiSparkles } from 'react-icons/hi';

export default function PostListHeader() {
  return (
    <div className='relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/[0.08] via-background to-background px-6 py-8 shadow-sm sm:px-8 sm:py-10'>
      <div className='absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl' />

      <div className='relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5'>
            <HiSparkles className='text-primary' size={16} />
            <span className='text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70'>
              Tin tức hàng ngày
            </span>
          </div>

          <h2 className='flex flex-wrap items-center gap-3 text-3xl font-black tracking-tight uppercase sm:text-4xl'>
            Bài viết <span className='text-primary'>mới nhất</span>
          </h2>

          <p className='mt-3 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-[15px]'>
            Cập nhật những bài viết mới về dinh dưỡng, sức khỏe và lối sống lành
            mạnh từ EatDee.
          </p>
        </div>
      </div>
    </div>
  );
}
