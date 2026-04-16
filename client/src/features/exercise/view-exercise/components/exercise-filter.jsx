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
  EXERCISE_EQUIPMENT_OPTIONS,
  EXERCISE_MUSCLE_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  WORKOUT_COUNTER_TYPE_OPTIONS
} from '~/constants/exercise';

const DEFAULT_FILTERS = {
  name: '',
  difficulty: '',
  type: '',
  logType: '',
  muscle: '',
  equipment: ''
};

export default function ExerciseFilter({
  filters,
  options,
  onSearch,
  onReset
}) {
  const [localFilters, setLocalFilters] = useState(filters ?? DEFAULT_FILTERS);

  const difficultyOptions =
    options?.difficulties ?? EXERCISE_DIFFICULTY_OPTIONS;
  const typeOptions = options?.types ?? EXERCISE_TYPE_OPTIONS;
  const logTypeOptions = options?.logTypes ?? WORKOUT_COUNTER_TYPE_OPTIONS;
  const muscleOptions = options?.muscles ?? EXERCISE_MUSCLE_OPTIONS;
  const equipmentOptions = options?.equipments ?? EXERCISE_EQUIPMENT_OPTIONS;

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
              {difficultyOptions.map(option => (
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
              {typeOptions.map(option => (
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
              {logTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-5 rounded-3xl bg-muted/35 p-4 sm:p-5'>
          <div>
            <p className='text-xl font-bold tracking-tight text-foreground'>
              Tìm theo nhóm cơ
            </p>
            <div className='mt-4 flex flex-wrap items-start gap-3'>
              {muscleOptions.map(option => {
                const isSelected = localFilters.muscle === option.value;

                return (
                  <button
                    key={option.value}
                    type='button'
                    aria-pressed={isSelected}
                    onClick={() =>
                      updateFilter('muscle', isSelected ? '' : option.value)
                    }
                    className={`group flex w-[96px] flex-col items-center gap-2 rounded-2xl p-1 text-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary/10 ring-2 ring-primary/35'
                        : 'hover:bg-background/90'
                    }`}
                  >
                    <div className='h-[62px] w-[92px] overflow-hidden rounded-xl bg-background shadow-sm ring-1 ring-border/50'>
                      <img
                        src={option.image || '/logo2.png'}
                        alt={option.label}
                        loading='lazy'
                        className='h-full w-full object-cover'
                      />
                    </div>
                    <span
                      className={`text-[14px] font-bold leading-tight transition-colors ${
                        isSelected
                          ? 'text-primary'
                          : 'text-foreground/80 group-hover:text-foreground'
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className='text-xl font-bold tracking-tight text-foreground'>
              Tìm theo thiết bị
            </p>
            <div className='mt-4 flex flex-wrap items-start gap-3'>
              {equipmentOptions.map(option => {
                const isSelected = localFilters.equipment === option.value;

                return (
                  <button
                    key={option.value}
                    type='button'
                    aria-pressed={isSelected}
                    onClick={() =>
                      updateFilter('equipment', isSelected ? '' : option.value)
                    }
                    className={`group flex w-[96px] flex-col items-center gap-2 rounded-2xl p-1 text-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary/10 ring-2 ring-primary/35'
                        : 'hover:bg-background/90'
                    }`}
                  >
                    <div className='h-[62px] w-[62px] overflow-hidden rounded-full bg-background shadow-sm ring-1 ring-border/50'>
                      <img
                        src={option.image || '/logo2.png'}
                        alt={option.label}
                        loading='lazy'
                        className='h-full w-full object-cover'
                      />
                    </div>
                    <span
                      className={`text-[14px] font-bold leading-tight transition-colors ${
                        isSelected
                          ? 'text-primary'
                          : 'text-foreground/80 group-hover:text-foreground'
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
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
