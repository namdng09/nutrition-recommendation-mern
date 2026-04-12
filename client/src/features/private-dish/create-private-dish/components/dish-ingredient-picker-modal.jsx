import { useMemo, useState } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaSearch,
  FaTimes,
  FaUndo
} from 'react-icons/fa';

import { INGREDIENT_CATEGORY } from '~/lib/utils';

const getNutrientValue = (nutrition, label) => {
  return nutrition?.nutrients?.find(item => item.label === label);
};

export default function DishIngredientPickerModal({
  open,
  onClose,
  ingredientOptions,
  selectedIngredientIds,
  onSelect
}) {
  const [showFilters, setShowFilters] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [draftCategories, setDraftCategories] = useState([]);

  const [appliedSearchName, setAppliedSearchName] = useState('');
  const [appliedCategories, setAppliedCategories] = useState([]);

  const categoryOptions = useMemo(() => {
    return Object.values(INGREDIENT_CATEGORY);
  }, []);

  const toggleDraftCategory = category => {
    setDraftCategories(prev =>
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
  };

  const handleSearch = () => {
    setAppliedSearchName(searchInput.trim());
    setAppliedCategories(draftCategories);
    setShowFilters(false);
  };

  const handleSearchKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const resetFilters = () => {
    setSearchInput('');
    setDraftCategories([]);
    setAppliedSearchName('');
    setAppliedCategories([]);
    setShowFilters(false);
  };

  const filteredIngredients = useMemo(() => {
    const normalizedSearch = appliedSearchName.trim().toLowerCase();

    return ingredientOptions.filter(item => {
      const matchesName =
        !normalizedSearch ||
        item.name?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        appliedCategories.length === 0 ||
        (item.categories || []).some(category =>
          appliedCategories.includes(category)
        );

      return matchesName && matchesCategory;
    });
  }, [ingredientOptions, appliedSearchName, appliedCategories]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative flex h-full items-center justify-center p-4 md:p-6'>
        <div className='flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-black/5'>
          <div className='border-b border-border px-6 py-5 md:px-7'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-black tracking-tight text-foreground'>
                  Chọn nguyên liệu
                </h2>

                <p className='mt-1 text-sm text-muted-foreground'>
                  Chỉ hiển thị các thông tin cần thiết để thêm nhanh vào món ăn.
                </p>
              </div>

              <button
                type='button'
                onClick={onClose}
                className='flex h-11 w-11 items-center justify-center rounded-full border border-border bg-accent text-muted-foreground transition hover:scale-105 hover:bg-accent/80 hover:text-foreground'
              >
                <FaTimes />
              </button>
            </div>

            <div className='mt-5 flex flex-wrap items-center gap-3'>
              <button
                type='button'
                onClick={() => setShowFilters(prev => !prev)}
                className='inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-bold text-foreground shadow-sm transition hover:bg-accent'
              >
                <FaFilter className='text-xs' />
                Bộ lọc
                {showFilters ? (
                  <FaChevronUp className='text-[11px]' />
                ) : (
                  <FaChevronDown className='text-[11px]' />
                )}
              </button>

              {(searchInput ||
                draftCategories.length > 0 ||
                appliedSearchName ||
                appliedCategories.length > 0) && (
                <button
                  type='button'
                  onClick={resetFilters}
                  className='inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-bold text-foreground shadow-sm transition hover:bg-accent'
                >
                  <FaUndo className='text-xs' />
                  Đặt lại
                </button>
              )}

              <p className='text-sm text-muted-foreground'>
                {filteredIngredients.length} nguyên liệu
              </p>
            </div>
          </div>

          {showFilters ? (
            <div className='border-b border-border px-6 py-5 md:px-7'>
              <div className='space-y-6'>
                <div>
                  <p className='mb-3 text-xs font-black uppercase tracking-[0.18em] text-primary'>
                    Search by name
                  </p>

                  <div className='relative'>
                    <FaSearch className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                    <input
                      type='text'
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder='Ví dụ: cà rốt, thịt bò, hành tím...'
                      className='h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10'
                    />
                  </div>
                </div>

                <div>
                  <p className='mb-3 text-xs font-black uppercase tracking-[0.18em] text-primary'>
                    Danh mục nguyên liệu
                  </p>

                  <div className='flex flex-wrap gap-3'>
                    {categoryOptions.map(category => {
                      const isActive = draftCategories.includes(category);

                      return (
                        <button
                          key={category}
                          type='button'
                          onClick={() => toggleDraftCategory(category)}
                          className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                            isActive
                              ? 'border-primary bg-primary text-primary-foreground shadow-md'
                              : 'border-border bg-background text-foreground hover:bg-accent'
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className='flex justify-end'>
                  <button
                    type='button'
                    onClick={handleSearch}
                    className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90'
                  >
                    <FaSearch className='text-xs' />
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className='grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-5 md:grid-cols-2 xl:grid-cols-3'>
            {filteredIngredients.length === 0 ? (
              <div className='col-span-full rounded-3xl border border-dashed border-border bg-muted/40 px-4 py-14 text-center text-sm text-muted-foreground'>
                Không có nguyên liệu phù hợp.
              </div>
            ) : (
              filteredIngredients.map(item => {
                const energy = getNutrientValue(item.nutrition, 'Năng lượng');
                const isAdded = selectedIngredientIds.includes(item._id);
                const primaryCategory = item.categories?.[0];

                return (
                  <div
                    key={item._id}
                    className='group rounded-3xl border border-border bg-background p-4 shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-xl'
                  >
                    <div className='flex items-start gap-4'>
                      <img
                        src={item.image}
                        alt={item.name}
                        className='h-20 w-20 shrink-0 rounded-2xl border border-border object-cover shadow-sm'
                      />

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <h3 className='truncate text-base font-black text-foreground'>
                              {item.name}
                            </h3>

                            {primaryCategory ? (
                              <p className='mt-1 text-xs font-medium text-muted-foreground'>
                                {primaryCategory}
                              </p>
                            ) : null}
                          </div>

                          <button
                            type='button'
                            disabled={isAdded}
                            onClick={() => onSelect(item)}
                            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary text-base font-bold text-primary-foreground shadow-md transition hover:scale-105 hover:opacity-90 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none'
                          >
                            {isAdded ? '✓' : '+'}
                          </button>
                        </div>

                        <div className='mt-4 flex flex-wrap gap-2'>
                          <span className='rounded-full border border-border bg-accent px-3 py-1 text-xs font-semibold text-foreground'>
                            {item.baseUnit?.amount || 0} g
                          </span>

                          <span className='rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300'>
                            {energy?.value || 0} {energy?.unit || 'kcal'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
