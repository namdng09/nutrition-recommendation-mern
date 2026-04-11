import { FaFilter, FaRedoAlt, FaSearch } from 'react-icons/fa';

import { DISH_CATEGORY_OPTIONS, NUTRITION_FOCUS_OPTIONS } from '~/lib/utils';

function ToggleChip({ active, children, onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
        active
          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
          : 'border-border bg-background text-foreground hover:border-emerald-500/40 hover:bg-emerald-500/5'
      }`}
    >
      {children}
    </button>
  );
}

export default function DishFilters({ filters, onChange, onReset, onSearch }) {
  const toggleArrayValue = (field, value) => {
    const current = Array.isArray(filters[field]) ? filters[field] : [];
    const exists = current.includes(value);

    onChange(
      field,
      exists ? current.filter(item => item !== value) : [...current, value]
    );
  };

  return (
    <div className='rounded-[28px] bg-card p-5 sm:p-6'>
      <div className='mb-6 flex items-start gap-3 pr-14'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm'>
          <FaFilter />
        </div>

        <div>
          <h3 className='text-lg font-black tracking-tight text-foreground'>
            Bộ lọc món ăn
          </h3>
          <p className='text-sm text-muted-foreground'>
            Chọn điều kiện rồi bấm tìm kiếm để hiển thị kết quả
          </p>
        </div>
      </div>

      <div className='grid gap-6'>
        <div>
          <label className='mb-2 block text-sm font-black uppercase tracking-[0.14em] text-muted-foreground'>
            Tìm theo tên
          </label>
          <div className='relative'>
            <FaSearch className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <input
              value={filters.name}
              onChange={e => onChange('name', e.target.value)}
              placeholder='Ví dụ: Cơm gà, phở bò, salad...'
              className='h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500'
            />
          </div>
        </div>

        <div>
          <label className='mb-3 block text-sm font-black uppercase tracking-[0.14em] text-muted-foreground'>
            Chế độ dinh dưỡng
          </label>
          <div className='flex flex-wrap gap-3'>
            {NUTRITION_FOCUS_OPTIONS.map(option => (
              <ToggleChip
                key={option.value}
                active={filters.nutritionFocus.includes(option.value)}
                onClick={() => toggleArrayValue('nutritionFocus', option.value)}
              >
                {option.label}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div>
          <label className='mb-3 block text-sm font-black uppercase tracking-[0.14em] text-muted-foreground'>
            Danh mục món ăn
          </label>
          <div className='flex flex-wrap gap-3'>
            {DISH_CATEGORY_OPTIONS.map(option => (
              <ToggleChip
                key={option.value}
                active={filters.categories.includes(option.value)}
                onClick={() => toggleArrayValue('categories', option.value)}
              >
                {option.label}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div className='flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={onReset}
            className='inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted'
          >
            <FaRedoAlt size={12} />
            Đặt lại
          </button>

          <button
            type='button'
            onClick={onSearch}
            className='inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110'
          >
            <FaSearch size={12} />
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
}
