import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { POST_CATEGORY_OPTIONS } from '~/constants/post-category';

const DEFAULT_FILTERS = {
  title: '',
  category: ''
};

export default function PostFilter({ filters, onSearch, onReset }) {
  const [localFilters, setLocalFilters] = useState(filters ?? DEFAULT_FILTERS);

  useEffect(() => {
    setLocalFilters(filters ?? DEFAULT_FILTERS);
  }, [filters]);

  const hasFilters = Object.values(localFilters).some(Boolean);

  const handleSubmit = event => {
    event.preventDefault();
    onSearch({
      ...localFilters,
      title: localFilters.title.trim()
    });
  };

  const handleClear = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onReset();
  };

  return (
    <div className='rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm sm:p-5'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3 sm:gap-4'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
          <Input
            value={localFilters.title}
            onChange={event =>
              setLocalFilters(prev => ({
                ...prev,
                title: event.target.value
              }))
            }
            placeholder='Tìm kiếm theo tiêu đề...'
            className='h-11 lg:flex-1'
          />

          <Select
            value={localFilters.category || '__all__'}
            onValueChange={value =>
              setLocalFilters(prev => ({
                ...prev,
                category: value === '__all__' ? '' : value
              }))
            }
          >
            <SelectTrigger className='h-11 w-full lg:w-64'>
              <SelectValue placeholder='Danh mục' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__all__'>Tất cả danh mục</SelectItem>
              {POST_CATEGORY_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='flex flex-wrap items-center gap-3 lg:shrink-0'>
            <Button type='submit' className='h-10 rounded-xl px-5'>
              <Search className='mr-2 h-4 w-4' />
              Tìm kiếm
            </Button>

            {hasFilters && (
              <Button
                type='button'
                variant='outline'
                onClick={handleClear}
                className='h-10 rounded-xl px-5'
              >
                <X className='mr-2 h-4 w-4' />
                Xóa lọc
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
