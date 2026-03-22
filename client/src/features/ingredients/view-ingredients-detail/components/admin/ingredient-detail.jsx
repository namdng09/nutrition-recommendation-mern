import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Pie, PieChart, ResponsiveContainer } from 'recharts';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import DeleteIngredientDialog from '~/features/ingredients/delete-ingredient/components/nutritionist/delete-ingredient-dialog';
import { useIngredientDetail } from '~/features/ingredients/view-ingredients-detail/api/view-ingredient-detail';

import IngredientDetailSkeleton from './ingredient-detail-skeleton';

const COLORS = {
  protein: '#a855f7',
  carbs: '#eab308',
  fat: '#06b6d4'
};

const IngredientDetail = ({ id }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: ingredient, isLoading } = useIngredientDetail(id);

  const handleBack = () => {
    navigate('/admin/manage-ingredients');
  };

  const handleDeleteSuccess = () => {
    navigate('/admin/manage-ingredients');
  };

  if (isLoading) {
    return <IngredientDetailSkeleton />;
  }

  if (!ingredient) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-muted-foreground'>Không tìm thấy nguyên liệu</p>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Helper function để lấy giá trị nutrient
  const getNutrientValue = (nutrients, label, defaultValue = 0) => {
    const nutrient = nutrients?.find(n => n.label === label);
    return nutrient?.value ?? defaultValue;
  };

  const nutrients = ingredient?.nutrition?.nutrients || [];
  const protein = getNutrientValue(nutrients, 'Protein', 0);
  const carbs = getNutrientValue(nutrients, 'Tinh bột', 0);
  const fat = getNutrientValue(nutrients, 'Chất béo', 0);

  const macronutrients = [
    { name: 'Protein', value: protein, color: COLORS.protein },
    { name: 'Tinh bột', value: carbs, color: COLORS.carbs },
    { name: 'Chất béo', value: fat, color: COLORS.fat }
  ].filter(item => item.value > 0);

  const totalMacros = macronutrients.reduce((sum, item) => sum + item.value, 0);

  const displayImage = ingredient?.image || 'https://via.placeholder.com/128';

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Button variant='ghost' size='sm' onClick={handleBack} className='mb-4'>
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      {/* Profile Card */}
      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-start'>
        <div className='relative'>
          <img
            src={displayImage}
            alt={ingredient?.name}
            className='h-32 w-32 object-cover rounded-lg'
          />
        </div>

        <div className='flex-1 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2 mb-2'>
            <h2 className='text-2xl font-bold'>{ingredient?.name}</h2>
            <Badge variant={ingredient?.isActive ? 'default' : 'secondary'}>
              {ingredient?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {ingredient?.categories && ingredient.categories.length > 0 && (
            <div className='flex gap-1.5 flex-wrap justify-center md:justify-start mb-3'>
              {ingredient.categories.map((cat, idx) => (
                <Badge key={idx} variant='outline'>
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          <div className='flex gap-2 flex-wrap justify-center md:justify-start'>
            {getNutrientValue(nutrients, 'Năng lượng') > 0 && (
              <Badge variant='outline'>
                {getNutrientValue(nutrients, 'Năng lượng')} kcal
              </Badge>
            )}
            {protein > 0 && (
              <Badge variant='outline' className='bg-purple-500/10'>
                Protein: {protein}g
              </Badge>
            )}
            {carbs > 0 && (
              <Badge variant='outline' className='bg-yellow-500/10'>
                Carbs: {carbs}g
              </Badge>
            )}
            {fat > 0 && (
              <Badge variant='outline' className='bg-cyan-500/10'>
                Fat: {fat}g
              </Badge>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa
          </Button>
        </div>
      </div>

      {/* Nutrition Chart */}
      {totalMacros > 0 && (
        <div className='bg-card rounded-lg border p-6 mb-6'>
          <h3 className='text-lg font-semibold mb-4'>Thông tin dinh dưỡng</h3>
          <div className='flex flex-col md:flex-row items-center gap-6'>
            <div className='w-full md:w-64 h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={macronutrients}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {macronutrients.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='flex-1 space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Cho {ingredient.baseUnit?.amount || 100}{' '}
                {ingredient.baseUnit?.unit || 'g'}
              </p>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-lg font-semibold'>Calories</span>
                  </div>
                  <span className='text-lg font-bold'>
                    {getNutrientValue(nutrients, 'Năng lượng', 0)}
                  </span>
                </div>

                {macronutrients.map((macro, idx) => {
                  const percentage =
                    totalMacros > 0
                      ? ((macro.value / totalMacros) * 100).toFixed(0)
                      : 0;
                  return (
                    <div
                      key={idx}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{ backgroundColor: macro.color }}
                        />
                        <span className='text-sm font-medium'>
                          {macro.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm text-muted-foreground'>
                          {percentage}%
                        </span>
                        <span className='text-sm font-semibold min-w-[3rem] text-right'>
                          {macro.value}g
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className='my-3' />

              <div className='space-y-1.5'>
                {getNutrientValue(nutrients, 'Chất xơ') > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Fiber</span>
                    <span className='font-medium'>
                      {getNutrientValue(nutrients, 'Chất xơ')}g
                    </span>
                  </div>
                )}
                {getNutrientValue(nutrients, 'Natri') > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Sodium</span>
                    <span className='font-medium'>
                      {getNutrientValue(nutrients, 'Natri')}mg
                    </span>
                  </div>
                )}
                {getNutrientValue(nutrients, 'Cholesterol') > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Cholesterol</span>
                    <span className='font-medium'>
                      {getNutrientValue(nutrients, 'Cholesterol')}mg
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className='bg-card rounded-lg border p-6 space-y-6'>
        <h2 className='text-lg font-semibold'>Thông tin chi tiết</h2>

        {/* Basic Information */}
        <div className='space-y-4'>
          {ingredient?.description && (
            <div>
              <h3 className='text-sm font-medium mb-2'>Mô tả</h3>
              <p className='text-sm text-muted-foreground'>
                {ingredient.description}
              </p>
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Categories */}
            {ingredient?.categories && ingredient.categories.length > 0 && (
              <div>
                <h3 className='text-sm font-medium mb-2'>Danh mục</h3>
                <div className='flex flex-wrap gap-2'>
                  {ingredient.categories.map((cat, idx) => (
                    <Badge key={idx} variant='secondary'>
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {ingredient?.allergens && ingredient.allergens.length > 0 && (
              <div>
                <h3 className='text-sm font-medium mb-2'>Chất gây dị ứng</h3>
                <div className='flex flex-wrap gap-2'>
                  {ingredient.allergens.map((allergen, idx) => (
                    <Badge key={idx} variant='secondary'>
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Base Unit */}
          <div>
            <h3 className='text-sm font-medium mb-2'>Khối lượng cơ sở</h3>
            <p className='text-sm'>
              {ingredient.baseUnit?.amount || 100}{' '}
              {ingredient.baseUnit?.unit || 'g'}
            </p>
          </div>
        </div>

        <Separator />

        {/* All Nutrients */}
        {nutrients.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Giá trị dinh dưỡng</h3>
            <div className='grid grid-cols-2 gap-3'>
              {nutrients.map((nutrient, idx) => (
                <div
                  key={idx}
                  className='flex justify-between items-center p-2 bg-muted rounded-md'
                >
                  <span className='text-sm'>{nutrient.label}</span>
                  <span className='text-sm font-medium'>
                    {nutrient.value} {nutrient.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minerals */}
        {ingredient?.nutrition?.minerals &&
          ingredient.nutrition.minerals.length > 0 && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold'>Khoáng chất</h3>
                <div className='grid grid-cols-2 gap-3'>
                  {ingredient.nutrition.minerals.map((mineral, idx) => (
                    <div
                      key={idx}
                      className='flex justify-between items-center p-2 bg-muted rounded-md'
                    >
                      <span className='text-sm'>{mineral.label}</span>
                      <span className='text-sm font-medium'>
                        {mineral.value} {mineral.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        {/* Vitamins */}
        {ingredient?.nutrition?.vitamins &&
          ingredient.nutrition.vitamins.length > 0 && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold'>Vitamin</h3>
                <div className='grid grid-cols-2 gap-3'>
                  {ingredient.nutrition.vitamins.map((vitamin, idx) => (
                    <div
                      key={idx}
                      className='flex justify-between items-center p-2 bg-muted rounded-md'
                    >
                      <span className='text-sm'>{vitamin.label}</span>
                      <span className='text-sm font-medium'>
                        {vitamin.value} {vitamin.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
      </div>

      <DeleteIngredientDialog
        ingredient={ingredient}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default IngredientDetail;
