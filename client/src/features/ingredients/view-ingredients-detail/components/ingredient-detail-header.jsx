import { FaArrowLeft } from 'react-icons/fa';

export default function IngredientDetailHeader({ navigate, item }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <button
        onClick={() => navigate(-1)}
        className='group inline-flex items-center gap-3 text-xs font-extrabold tracking-widest text-muted-foreground transition hover:text-primary'
      >
        <span className='flex h-9 w-9 items-center justify-center rounded-full bg-secondary ring-1 ring-border group-hover:bg-primary group-hover:text-white'>
          <FaArrowLeft className='transition-transform group-hover:-translate-x-1' />
        </span>
        QUAY LẠI
      </button>

      <div className='flex flex-wrap gap-2 text-sm'>
        {item?.categories?.map(c => (
          <span
            key={c}
            className='inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 font-medium text-accent-foreground'
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
