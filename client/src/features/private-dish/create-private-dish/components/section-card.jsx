export default function SectionCard({
  title,
  description,
  rightAction,
  children
}) {
  return (
    <section className='rounded-[32px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]'>
      <div className='border-b border-slate-100 px-6 py-5 md:px-7'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-lg font-black tracking-tight text-slate-900 md:text-[20px]'>
              {title}
            </h2>
            {description ? (
              <p className='mt-1 text-sm leading-relaxed text-slate-500'>
                {description}
              </p>
            ) : null}
          </div>
          {rightAction}
        </div>
      </div>

      <div className='px-6 py-6 md:px-7'>{children}</div>
    </section>
  );
}
