import { Ban, Salad, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { ViewBlockDishes } from '~/features/users/view-block-dishes/components/view-block-dishes';
import { ViewBlockIngredients } from '~/features/users/view-block-ingredients/components/view-block-ingredient';

export function ViewBlocks() {
  const [activeTab, setActiveTab] = useState('dishes');

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10'>
              <Ban className='h-5 w-5 text-destructive' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Danh sách chặn
            </h1>
          </div>
          <p className='text-muted-foreground'>
            Quản lý món ăn và nguyên liệu bị chặn khỏi gợi ý
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='dishes' className='gap-2'>
              <UtensilsCrossed className='h-4 w-4' />
              <span>Món ăn</span>
            </TabsTrigger>
            <TabsTrigger value='ingredients' className='gap-2'>
              <Salad className='h-4 w-4' />
              <span>Nguyên liệu</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='dishes' className='mt-6'>
            <ViewBlockDishes />
          </TabsContent>

          <TabsContent value='ingredients' className='mt-6'>
            <ViewBlockIngredients />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
