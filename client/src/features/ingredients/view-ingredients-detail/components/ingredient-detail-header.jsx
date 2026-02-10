import { ArrowLeft } from 'lucide-react';

import { Button } from '~/components/ui/button';

export default function IngredientDetailHeader({ navigate, item }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <Button
        variant='ghost'
        className='rounded-xl'
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Quay lại
      </Button>

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
