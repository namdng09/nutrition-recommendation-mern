import { ArrowLeft, Clock, Eye, EyeOff, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import DeleteDishDialog from '~/features/dishes/delete-dish/components/nutritionist/delete-dish-dialog';
import { useDishesDetail } from '~/features/dishes/view-dishes-detail/api/view-dishes-detail';

import DishDetailSkeleton from './dish-detail-skeleton';

const DishDetail = ({ id }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: dish, isLoading } = useDishesDetail(id);

  const handleBack = () => {
    navigate('/admin/manage-dishes');
  };

  const handleDeleteSuccess = () => {
    navigate('/admin/manage-dishes');
  };

  if (isLoading) {
    return <DishDetailSkeleton />;
  }

  if (!dish) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-muted-foreground'>Không tìm thấy món ăn</p>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const displayImage = dish?.image || 'https://via.placeholder.com/128';

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
            alt={dish?.name}
            className='h-32 w-32 object-cover rounded-lg'
          />
        </div>

        <div className='flex-1 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2 mb-2'>
            <h1 className='text-2xl font-bold'>{dish?.name}</h1>
            <Badge variant={dish?.isActive ? 'default' : 'secondary'}>
              {dish?.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant={dish?.isPublic ? 'default' : 'outline'}>
              {dish?.isPublic ? (
                <>
                  <Eye className='h-3 w-3 mr-1' />
                  Công khai
                </>
              ) : (
                <>
                  <EyeOff className='h-3 w-3 mr-1' />
                  Riêng tư
                </>
              )}
            </Badge>
          </div>

          {dish?.categories && dish.categories.length > 0 && (
            <div className='flex gap-1.5 flex-wrap justify-center md:justify-start mb-3'>
              {dish.categories.map((cat, idx) => (
                <Badge key={idx} variant='outline' className='text-xs'>
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          <div className='flex gap-3 flex-wrap justify-center md:justify-start text-sm text-muted-foreground'>
            {dish?.servings && (
              <div className='flex items-center gap-1'>
                <Users className='h-4 w-4' />
                <span>{dish.servings} phần</span>
              </div>
            )}
            {(dish?.preparationTime > 0 || dish?.cookTime > 0) && (
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                <span>
                  {(dish?.preparationTime || 0) + (dish?.cookTime || 0)} phút
                </span>
              </div>
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

      {/* Content */}
      <div className='bg-card rounded-lg border p-6 space-y-6'>
        <h2 className='text-lg font-semibold'>Thông tin món ăn</h2>

        {/* Basic Information */}
        <div className='space-y-4'>
          {dish?.description && (
            <div>
              <h3 className='text-sm font-medium mb-2'>Mô tả</h3>
              <p className='text-sm text-muted-foreground'>
                {dish.description}
              </p>
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Categories */}
            {dish?.categories && dish.categories.length > 0 && (
              <div>
                <h3 className='text-sm font-medium mb-2'>Danh mục</h3>
                <div className='flex flex-wrap gap-2'>
                  {dish.categories.map((cat, idx) => (
                    <Badge key={idx} variant='secondary'>
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Focus */}
            {dish?.nutritionFocus && dish.nutritionFocus.length > 0 && (
              <div>
                <h3 className='text-sm font-medium mb-2'>
                  Mục tiêu dinh dưỡng
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {dish.nutritionFocus.map((focus, idx) => (
                    <Badge key={idx} variant='secondary'>
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time & Servings */}
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <h3 className='text-sm font-medium mb-2'>Số phần ăn</h3>
              <p className='text-sm'>{dish.servings || 0}</p>
            </div>
            <div>
              <h3 className='text-sm font-medium mb-2'>Thời gian chuẩn bị</h3>
              <p className='text-sm'>{dish.preparationTime || 0} phút</p>
            </div>
            <div>
              <h3 className='text-sm font-medium mb-2'>Thời gian nấu</h3>
              <p className='text-sm'>{dish.cookTime || 0} phút</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Ingredients Section */}
        {dish?.ingredients && dish.ingredients.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Nguyên liệu</h3>
            <div className='space-y-3'>
              {dish.ingredients.map((ingredient, idx) => (
                <Card key={idx}>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      {ingredient.image && (
                        <img
                          src={ingredient.image}
                          alt={ingredient.name}
                          className='h-16 w-16 rounded object-cover border'
                        />
                      )}
                      <div className='flex-1'>
                        <h4 className='font-medium'>{ingredient.name}</h4>
                        {ingredient.description && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            {ingredient.description}
                          </p>
                        )}
                        {ingredient.units && ingredient.units.length > 0 && (
                          <div className='mt-2 space-y-1'>
                            {ingredient.units.map((unit, unitIdx) => (
                              <div
                                key={unitIdx}
                                className='flex items-center gap-2 text-sm'
                              >
                                <span className='font-medium'>
                                  {unit.quantity} {unit.unit}
                                </span>
                                {unit.isDefault && (
                                  <Badge variant='outline' className='text-xs'>
                                    Mặc định
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Nutrition Section */}
        {dish?.nutrition && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Thông tin dinh dưỡng</h3>

            {/* Nutrients */}
            {dish.nutrition.nutrients &&
              dish.nutrition.nutrients.length > 0 && (
                <div>
                  <h4 className='text-sm font-medium mb-2'>Dưỡng chất</h4>
                  <div className='grid grid-cols-2 gap-3'>
                    {dish.nutrition.nutrients.map((nutrient, idx) => (
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
            {dish.nutrition.minerals && dish.nutrition.minerals.length > 0 && (
              <div>
                <h4 className='text-sm font-medium mb-2'>Khoáng chất</h4>
                <div className='grid grid-cols-2 gap-3'>
                  {dish.nutrition.minerals.map((mineral, idx) => (
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
            )}

            {/* Vitamins */}
            {dish.nutrition.vitamins && dish.nutrition.vitamins.length > 0 && (
              <div>
                <h4 className='text-sm font-medium mb-2'>Vitamin</h4>
                <div className='grid grid-cols-2 gap-3'>
                  {dish.nutrition.vitamins.map((vitamin, idx) => (
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
            )}
          </div>
        )}

        <Separator />

        {/* Instructions Section */}
        {dish?.instructions && dish.instructions.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Hướng dẫn nấu</h3>
            <div className='space-y-3'>
              {dish.instructions.map((instruction, idx) => (
                <Card key={idx}>
                  <CardContent className='p-4'>
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>
                        Bước {instruction.step}
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        {instruction.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Tags Section */}
        {dish?.tags && dish.tags.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Tags</h3>
            <div className='flex flex-wrap gap-2'>
              {dish.tags.map((tag, idx) => (
                <Badge key={idx} variant='outline'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <DeleteDishDialog
        dish={dish}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default DishDetail;
