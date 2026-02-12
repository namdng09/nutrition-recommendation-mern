import React, { useState } from 'react';
import { HiPlus } from 'react-icons/hi';

import { Button } from '~/components/ui/button';

import AddIngredientModal from './add-ingredient-modal';

const AddIngredientButton = ({ groceryId }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size='sm'
        variant='ghost'
        onClick={() => setOpen(true)}
        className='
          h-8 px-3
          bg-accent/50 
          border-2 border-dashed border-primary/40
          text-primary text-[11px] font-mono font-bold uppercase tracking-wider
          rounded-xl
          flex items-center gap-1.5
          transition-all duration-300
          hover:bg-primary hover:text-white hover:border-solid hover:shadow-lg hover:shadow-primary/20
          active:scale-95
        '
      >
        <HiPlus className='text-base stroke-1' />
        <span>Thêm món</span>
      </Button>

      <AddIngredientModal
        open={open}
        onOpenChange={setOpen}
        groceryId={groceryId}
      />
    </>
  );
};

export default AddIngredientButton;
