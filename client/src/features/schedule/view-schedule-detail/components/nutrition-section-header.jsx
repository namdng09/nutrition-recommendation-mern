export default function NutritionSectionHeader({ icon, title, desc, badge }) {
  return (
    <div className='mb-5 flex items-start justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          {icon}
        </span>

        <div>
          <h2 className='text-lg font-black text-foreground'>{title}</h2>
          {desc && <p className='text-[12px] text-muted-foreground'>{desc}</p>}
        </div>
      </div>

      {badge ? (
        <span className='rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary'>
          {badge}
        </span>
      ) : null}
    </div>
  );
}
