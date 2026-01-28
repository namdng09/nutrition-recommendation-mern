import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/text-area';
import DeleteIngredientDialog from '~/features/ingredients/delete-ingredient/components/nutritionist/delete-ingredient-dialog';
import { useUpdateIngredient } from '~/features/ingredients/update-ingredient/api/update-ingredient';
import { updateIngredientSchema } from '~/features/ingredients/update-ingredient/schemas/update-ingredient-schema';
import { useIngredientDetail } from '~/features/ingredients/view-ingredients-detail/api/view-ingredient-detail';

const CATEGORY_OPTIONS = [
  { value: 'Meat', label: 'Thịt' },
  { value: 'Vegetable', label: 'Rau' },
  { value: 'Fruit', label: 'Trái cây' },
  { value: 'Grain', label: 'Ngũ cốc' },
  { value: 'Dairy', label: 'Sữa' },
  { value: 'Seafood', label: 'Hải sản' },
  { value: 'Other', label: 'Khác' }
];

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

const IngredientDetail = ({ id }) => {
  const navigate = useNavigate();

  const { data: ingredient } = useIngredientDetail(id);
  const { mutate: updateIngredient, isPending: isUpdating } =
    useUpdateIngredient({
      onSuccess: response => {
        toast.success(response.message || 'Cập nhật nguyên liệu thành công');
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Cập nhật nguyên liệu thất bại'
        );
      }
    });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm({
    resolver: yupResolver(updateIngredientSchema),
    values: ingredient
      ? {
          name: ingredient.name || '',
          category: ingredient.category || '',
          unit: ingredient.unit || '',
          caloriesPer100g: ingredient.caloriesPer100g?.toString() || '0',
          protein: ingredient.protein?.toString() || '0',
          carbs: ingredient.carbs?.toString() || '0',
          fat: ingredient.fat?.toString() || '0',
          fiber: ingredient.fiber?.toString() || '0',
          image: ingredient.image || '',
          isActive: ingredient.isActive?.toString() || 'true'
        }
      : undefined
  });

  const handleSave = data => {
    updateIngredient({ id, data });
  };

  const handleToggleActive = () => {
    updateIngredient({ id, data: { isActive: !ingredient.isActive } });
  };

  const handleBack = () => {
    navigate('/nutritionist/manage-ingredients');
  };

  const handleDeleteSuccess = () => {
    navigate('/nutritionist/manage-ingredients');
  };

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

  return (
    <div className='max-w-4xl mx-auto'>
      <Button variant='ghost' size='sm' onClick={handleBack} className='mb-4'>
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-start'>
        <img
          src={ingredient?.image}
          alt={ingredient?.name}
          className='h-32 w-32 object-cover rounded'
        />

        <div className='flex-1 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2'>
            <h2 className='text-2xl font-bold'>{ingredient?.name}</h2>
            <Badge variant={ingredient?.isActive ? 'default' : 'secondary'}>
              {ingredient?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className='text-muted-foreground'>{ingredient?.category}</p>
          <div className='flex gap-2 mt-2 flex-wrap justify-center md:justify-start'>
            <Badge variant='outline'>{ingredient?.caloriesPer100g} kcal</Badge>
            <Badge variant='outline'>Protein: {ingredient?.protein}g</Badge>
            <Badge variant='outline'>Carbs: {ingredient?.carbs}g</Badge>
            <Badge variant='outline'>Fat: {ingredient?.fat}g</Badge>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={ingredient?.isActive ? 'secondary' : 'default'}
            size='sm'
            onClick={handleToggleActive}
            disabled={isUpdating}
          >
            {ingredient?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
          <Button
            size='sm'
            onClick={form.handleSubmit(handleSave)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Spinner className='h-4 w-4 mr-1' />
            ) : (
              <Save className='h-4 w-4 mr-1' />
            )}
            Lưu
          </Button>
        </div>
      </div>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Thông tin nguyên liệu</h2>
        <Form {...form}>
          <form className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Tên nguyên liệu
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập tên nguyên liệu' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Danh mục
                  </FormLabel>
                  <Select
                    key={ingredient?.id + '-category-' + (field.value ?? '')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Chọn danh mục' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='unit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Đơn vị
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập đơn vị (g, ml, ...)' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='caloriesPer100g'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Calories (kcal)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Nhập caloriesPer100g'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='protein'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Protein (g)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Nhập protein'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='carbs'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Carbs (g)
                  </FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='Nhập carbs' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fat'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Fat (g)
                  </FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='Nhập fat' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fiber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Fiber (g)
                  </FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='Nhập fiber' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel className='text-muted-foreground'>
                    URL Hình ảnh
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập URL hình ảnh' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Trạng thái
                  </FormLabel>
                  <Select
                    key={ingredient?.id + '-isActive-' + (field.value ?? '')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Chọn trạng thái' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className='flex justify-start items-center mt-6 pt-6 border-t'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa nguyên liệu
          </Button>
        </div>
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
