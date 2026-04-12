export default function SectionCard({
  title,
  description,
  rightAction,
  children
}) {
  return (
    <section className='overflow-hidden rounded-[32px] border border-border bg-card text-card-foreground shadow-sm'>
      <div className='border-b border-border px-6 py-5 md:px-7'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-lg font-black tracking-tight text-foreground md:text-[20px]'>
              {title}
            </h2>
            {description ? (
              <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
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
