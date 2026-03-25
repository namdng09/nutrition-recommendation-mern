import { FaArrowLeft } from 'react-icons/fa';

export default function IngredientDetailHeader({ navigate, item }) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <button
        onClick={() => navigate(-1)}
        className='group inline-flex w-fit items-center gap-3 rounded-full bg-muted/50 px-3 py-2 text-xs font-extrabold tracking-[0.18em] text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary'
      >
        <span className='flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border transition-all group-hover:bg-primary group-hover:text-primary-foreground'>
          <FaArrowLeft className='transition-transform duration-300 group-hover:-translate-x-1' />
        </span>
        QUAY LẠI
      </button>

      <div className='flex flex-wrap gap-2'>
        {item?.categories?.map(c => (
          <span
            key={c}
            className='inline-flex items-center rounded-full bg-card px-3.5 py-1.5 text-xs font-bold text-foreground shadow-sm ring-1 ring-border/60 transition-all hover:bg-accent'
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
