import { HiMagnifyingGlass } from 'react-icons/hi2';

import { DISH_CATEGORY_OPTIONS, NUTRITION_FOCUS_OPTIONS } from '~/lib/utils';

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-accent'
      }`}
    >
      {children}
    </button>
  );
}

export default function DishFilterPanel({
  isFilterOpen,
  draftFilters,
  setDraftFilters,
  toggleCategory,
  handleResetDraftFilters,
  handleApplyFilters
}) {
  if (!isFilterOpen) return null;

  return (
    <div className='max-h-[260px] overflow-y-auto border-t border-border/50 border-b border-border/50 bg-background/95 px-4 py-3 custom-scrollbar'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <div className='lg:col-span-2'>
          <h5 className='mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary/70'>
            Search by name
          </h5>

          <div className='relative'>
            <HiMagnifyingGlass
              className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
              size={18}
            />
            <input
              value={draftFilters.name}
              onChange={e =>
                setDraftFilters(prev => ({
                  ...prev,
                  name: e.target.value
                }))
              }
              placeholder='Ví dụ: cơm gà, salad, phở bò...'
              className='h-10 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10'
            />
          </div>
        </div>

        <div>
          <h5 className='mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary/70'>
            Danh mục món ăn
          </h5>

          <div className='flex flex-wrap gap-2'>
            {DISH_CATEGORY_OPTIONS.map(option => (
              <FilterChip
                key={option.value}
                active={draftFilters.categories.includes(option.value)}
                onClick={() => toggleCategory(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <h5 className='mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary/70'>
            Chế độ dinh dưỡng
          </h5>

          <div className='flex flex-wrap gap-2'>
            {NUTRITION_FOCUS_OPTIONS.map(option => (
              <FilterChip
                key={option.value}
                active={draftFilters.nutritionFocus === option.value}
                onClick={() =>
                  setDraftFilters(prev => ({
                    ...prev,
                    nutritionFocus:
                      prev.nutritionFocus === option.value ? '' : option.value
                  }))
                }
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <div className='mt-4 flex items-center justify-end gap-3 border-t border-border/50 pt-3'>
        <button
          type='button'
          onClick={handleResetDraftFilters}
          className='rounded-2xl border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition hover:bg-accent'
        >
          Đặt lại
        </button>

        <button
          type='button'
          onClick={handleApplyFilters}
          className='inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90'
        >
          <HiMagnifyingGlass size={16} />
          Tìm kiếm
        </button>
      </div>
    </div>
  );
}
