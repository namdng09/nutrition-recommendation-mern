import { Heart, Package, Salad, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { ViewFavoriteCollections } from '~/features/users/view-favorite-collections/components/view-favorite-collections';
import { ViewFavoriteDishes } from '~/features/users/view-favorite-dishes/components/view-favorite-dishes';
import { ViewFavoriteIngredients } from '~/features/users/view-favorite-ingredients/components/view-favorite-ingredients';

export function ViewFavorites() {
  const [activeTab, setActiveTab] = useState('dishes');

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Heart className='h-5 w-5 text-primary' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Yêu thích
            </h1>
          </div>
          <p className='text-muted-foreground'>
            Quản lý món ăn, nguyên liệu và bộ sưu tập yêu thích của bạn
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full max-w-md grid-cols-3'>
            <TabsTrigger value='dishes' className='gap-2'>
              <UtensilsCrossed className='h-4 w-4' />
              <span className='hidden sm:inline'>Món ăn</span>
              <span className='sm:hidden'>Món</span>
            </TabsTrigger>
            <TabsTrigger value='ingredients' className='gap-2'>
              <Salad className='h-4 w-4' />
              <span className='hidden sm:inline'>Nguyên liệu</span>
              <span className='sm:hidden'>N.Liệu</span>
            </TabsTrigger>
            <TabsTrigger value='collections' className='gap-2'>
              <Package className='h-4 w-4' />
              <span className='hidden sm:inline'>Bộ sưu tập</span>
              <span className='sm:hidden'>BST</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='dishes' className='mt-6'>
            <ViewFavoriteDishes />
          </TabsContent>

          <TabsContent value='ingredients' className='mt-6'>
            <ViewFavoriteIngredients />
          </TabsContent>

          <TabsContent value='collections' className='mt-6'>
            <ViewFavoriteCollections />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
