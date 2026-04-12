import { Search, X } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { DISH_CATEGORY_OPTIONS } from '~/constants/dish-category';
import { buildQueryParams } from '~/lib/build-query-params';

const NUTRITION_FOCUS_OPTIONS = [
  { value: 'Giàu đạm', label: 'Giàu đạm' },
  { value: 'Ít tinh bột', label: 'Ít tinh bột' },
  { value: 'Ít béo', label: 'Ít béo' },
  { value: 'Giàu chất xơ', label: 'Giàu chất xơ' },
  { value: 'Ít muối', label: 'Ít muối' }
];

const DishFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const user = useSelector(state => state.auth.user);

  const form = useForm({
    values: {
      name: searchParams.get('name') || '',
      ingredient: searchParams.get('ingredient') || '',
      categories: searchParams.get('categories') || '',
      nutritionFocus: searchParams.get('nutritionFocus') || '',
      tags: searchParams.get('tags') || '',
      minServings: searchParams.get('servings[gte]') || '',
      maxServings: searchParams.get('servings[lte]') || '',
      maxPreparationTime: searchParams.get('preparationTime[lte]') || '',
      maxCookTime: searchParams.get('cookTime[lte]') || '',
      favoritesOnly: searchParams.get('favoritesOnly') === 'true',
      includeBlocked: searchParams.get('includeBlocked') === 'true'
    }
  });

  const handleSearch = data => {
    const sort = searchParams.get('sort');

    const mappedData = {
      name: data.name?.trim(),
      ingredient: data.ingredient?.trim(),
      categories: data.categories,
      nutritionFocus: data.nutritionFocus,
      tags: data.tags?.trim(),
      'servings[gte]': data.minServings,
      'servings[lte]': data.maxServings,
      'preparationTime[lte]': data.maxPreparationTime,
      'cookTime[lte]': data.maxCookTime,
      favoritesOnly: data.favoritesOnly ? true : undefined,
      includeBlocked: data.includeBlocked ? true : undefined
    };

    const filteredData = Object.fromEntries(
      Object.entries(mappedData).filter(
        ([_, value]) => value !== '' && value !== undefined && value !== null
      )
    );

    const queryParams = buildQueryParams({
      ...filteredData,
      page: 1,
      ...(sort ? { sort } : {})
    });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const handleReset = () => {
    form.reset({
      name: '',
      ingredient: '',
      categories: '',
      nutritionFocus: '',
      tags: '',
      minServings: '',
      maxServings: '',
      maxPreparationTime: '',
      maxCookTime: '',
      favoritesOnly: false,
      includeBlocked: false
    });

    const sort = searchParams.get('sort');
    const queryParams = buildQueryParams({
      page: 1,
      ...(sort ? { sort } : {})
    });

    startTransition(() => {
      setSearchParams(queryParams);
    });
  };

  const watched = form.watch();
  const hasFilters = Boolean(
    watched.name?.trim() ||
      watched.ingredient?.trim() ||
      watched.categories ||
      watched.nutritionFocus ||
      watched.tags?.trim() ||
      watched.minServings ||
      watched.maxServings ||
      watched.maxPreparationTime ||
      watched.maxCookTime ||
      watched.favoritesOnly ||
      watched.includeBlocked
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSearch)} className='space-y-4'>
        <div className='rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        placeholder='Tìm theo tên món ăn...'
                        className='h-11 pl-9'
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ingredient'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        placeholder='Tìm theo nguyên liệu...'
                        className='h-11 pl-9'
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='categories'
              render={({ field }) => (
                <FormItem>
                  <Select
                    value={field.value || '__all__'}
                    onValueChange={value =>
                      field.onChange(value === '__all__' ? '' : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className='h-11'>
                        <SelectValue placeholder='Danh mục món ăn' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='__all__'>Tất cả danh mục</SelectItem>
                      {DISH_CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name='nutritionFocus'
              render={({ field }) => (
                <FormItem>
                  <Select
                    value={field.value || '__all__'}
                    onValueChange={value =>
                      field.onChange(value === '__all__' ? '' : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className='h-11'>
                        <SelectValue placeholder='Mục tiêu dinh dưỡng' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='__all__'>Tất cả mục tiêu</SelectItem>
                      {NUTRITION_FOCUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            /> */}

            {/* <FormField
              control={form.control}
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder='Tìm theo tag...'
                      className='h-11'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}

            {/* <FormField
              control={form.control}
              name='minServings'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      placeholder='Số phần tối thiểu'
                      className='h-11'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}

            {/* <FormField
              control={form.control}
              name='maxServings'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      placeholder='Số phần tối đa'
                      className='h-11'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}

            {/* <FormField
              control={form.control}
              name='maxPreparationTime'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      placeholder='Chuẩn bị tối đa (phút)'
                      className='h-11'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}

            {/* <FormField
              control={form.control}
              name='maxCookTime'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      placeholder='Nấu tối đa (phút)'
                      className='h-11'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}
          </div>

          {user && (
            <div className='mt-3 flex flex-wrap items-center gap-4'>
              <FormField
                control={form.control}
                name='favoritesOnly'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={checked =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <span className='text-sm text-foreground'>
                      Chỉ món ăn yêu thích
                    </span>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='includeBlocked'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={checked =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <span className='text-sm text-foreground'>
                      Bao gồm món ăn đã chặn
                    </span>
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className='mt-3 flex flex-wrap gap-2'>
            <Button type='submit' className='h-10 px-5' disabled={isPending}>
              <Search className='mr-2 h-4 w-4' />
              {isPending ? 'Đang tìm...' : 'Tìm món ăn'}
            </Button>

            {hasFilters && (
              <Button
                type='button'
                variant='outline'
                className='h-10 px-5'
                onClick={handleReset}
                disabled={isPending}
              >
                <X className='mr-2 h-4 w-4' />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default DishFilter;
