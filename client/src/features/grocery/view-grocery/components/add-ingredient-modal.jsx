import { Plus, Search, ShoppingBasket } from 'lucide-react';
import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { useIngredients } from '~/features/ingredients/view-ingredients/api/view-ingredient';

import { useAddGroceryIngredient } from '../../add-grocery-ingredient/api/add-grocery-ingredient';

const AddIngredientModal = ({ open, onOpenChange, groceryId }) => {
  const { data } = useIngredients({ limit: 1000 });
  const { mutate } = useAddGroceryIngredient();
  const [search, setSearch] = useState('');

  const ingredients = data?.docs ?? [];
  const filteredIngredients = ingredients.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = id => {
    mutate({
      groceryId,
      ingredients: [id]
    });
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl p-0 overflow-hidden border-none shadow-2xl'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b bg-gradient-to-b from-muted/50 to-background'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <ShoppingBasket className='w-5 h-5 text-primary' />
            </div>
            <DialogTitle className='text-xl font-bold tracking-tight'>
              Chọn nguyên liệu
            </DialogTitle>
          </div>

          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Tìm tên nguyên liệu...'
              className='pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className='px-4 py-4 max-h-[450px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/20'>
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map(item => (
              <div
                key={item._id}
                onClick={() => handleAdd(item._id)}
                className='
                  group flex items-center gap-4 p-3
                  rounded-2xl border border-transparent bg-card
                  cursor-pointer transition-all duration-300
                  hover:bg-accent hover:border-primary/20 hover:shadow-sm
                  active:scale-[0.98]
                '
              >
                <div className='relative w-16 h-16 shrink-0 overflow-hidden rounded-xl border bg-muted'>
                  <img
                    src={item.image}
                    alt={item.name}
                    className='w-full h-full object-cover transition duration-500 group-hover:scale-110'
                  />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='font-bold text-base truncate group-hover:text-primary transition-colors'>
                    {item.name}
                  </div>
                  <div className='flex flex-wrap gap-1.5 mt-1.5'>
                    {item.categories?.slice(0, 2).map(cat => (
                      <span
                        key={cat}
                        className='text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider'
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className='
                  flex items-center justify-center w-10 h-10 rounded-full
                  bg-muted text-muted-foreground
                  group-hover:bg-primary group-hover:text-white
                  transition-all duration-300 shadow-sm
                '
                >
                  <Plus className='w-5 h-5' />
                </div>
              </div>
            ))
          ) : (
            <div className='py-12 text-center'>
              <p className='text-muted-foreground text-sm italic'>
                {search
                  ? 'Không tìm thấy kết quả phù hợp'
                  : 'Chưa có dữ liệu nguyên liệu'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddIngredientModal;
