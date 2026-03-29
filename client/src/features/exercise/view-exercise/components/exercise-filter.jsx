import { Search, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import {
  EXERCISE_DIFFICULTY_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  WORKOUT_COUNTER_TYPE_OPTIONS
} from '~/constants/exercise';

const DEFAULT_FILTERS = {
  name: '',
  difficulty: '',
  type: '',
  logType: ''
};

export default function ExerciseFilter({ filters, onSearch, onReset }) {
  const [localFilters, setLocalFilters] = useState(filters ?? DEFAULT_FILTERS);

  const hasFilters = Object.values(localFilters).some(Boolean);

  const handleSubmit = event => {
    event.preventDefault();

    onSearch({
      ...localFilters,
      name: localFilters.name.trim()
    });
  };

  const handleClear = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onReset();
  };

  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className='rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm sm:p-5'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3 sm:gap-4'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <Input
            value={localFilters.name}
            onChange={event => updateFilter('name', event.target.value)}
            placeholder='Tìm theo tên bài tập...'
          />

          <Select
            value={localFilters.difficulty || '__all__'}
            onValueChange={value =>
              updateFilter('difficulty', value === '__all__' ? '' : value)
            }
          >
            <SelectTrigger className='h-11 w-full'>
              <SelectValue placeholder='Độ khó' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__all__'>Độ khó</SelectItem>
              {EXERCISE_DIFFICULTY_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={localFilters.type || '__all__'}
            onValueChange={value =>
              updateFilter('type', value === '__all__' ? '' : value)
            }
          >
            <SelectTrigger className='h-11 w-full'>
              <SelectValue placeholder='Loại bài tập' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__all__'>Tất cả loại bài tập</SelectItem>
              {EXERCISE_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={localFilters.logType || '__all__'}
            onValueChange={value =>
              updateFilter('logType', value === '__all__' ? '' : value)
            }
          >
            <SelectTrigger className='h-11 w-full'>
              <SelectValue placeholder='Loại đếm' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__all__'>Tất cả loại đếm</SelectItem>
              {WORKOUT_COUNTER_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <Button type='submit' className='h-10 rounded-xl px-5'>
            <Search className='mr-2 h-4 w-4' />
            Tìm bài tập
          </Button>

          {hasFilters && (
            <Button
              type='button'
              variant='outline'
              onClick={handleClear}
              className='h-10 rounded-xl px-5'
            >
              <X className='mr-2 h-4 w-4' />
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
