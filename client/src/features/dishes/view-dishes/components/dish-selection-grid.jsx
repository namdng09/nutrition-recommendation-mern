import { HiFire, HiPlus } from 'react-icons/hi2';

export default function DishSelectionGrid({
  dishes,
  isFilterOpen,
  handleAddDish
}) {
  return (
    <div
      className={`overflow-y-auto p-4 custom-scrollbar ${
        isFilterOpen ? 'max-h-[300px]' : 'max-h-[500px]'
      }`}
    >
      <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
        {dishes.map(dish => {
          const calories =
            dish.nutrition?.nutrients?.find(n => n.label === 'Năng lượng')
              ?.value ?? 0;
          const totalTime = (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

          return (
            <button
              key={dish._id}
              type='button'
              onClick={() => handleAddDish(dish)}
              className='group flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-background/40 p-3 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-md'
            >
              <div className='h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border'>
                <img
                  src={dish.image || '/logo2.png'}
                  alt={dish.name}
                  className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                />
              </div>

              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex flex-wrap gap-1'>
                  {dish.categories?.map((cat, idx) => (
                    <span
                      key={idx}
                      className='rounded bg-muted px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/70'
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <h4 className='truncate text-sm font-bold text-foreground'>
                  {dish.name}
                </h4>

                <div className='mt-1.5 flex items-center gap-3 text-[11px]'>
                  <span className='text-muted-foreground'>
                    {totalTime} phút
                  </span>
                  <span className='h-1 w-1 rounded-full bg-border' />
                  <span className='flex items-center gap-1 font-black text-destructive'>
                    <HiFire size={14} />
                    {calories} kcal
                  </span>
                </div>
              </div>

              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  handleAddDish(dish);
                }}
                className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95'
              >
                <HiPlus size={20} />
              </button>
            </button>
          );
        })}

        {dishes.length === 0 ? (
          <div className='col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
            Không tìm thấy món ăn phù hợp
          </div>
        ) : null}
      </div>
    </div>
  );
}
