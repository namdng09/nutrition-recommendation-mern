import { HiOutlineArrowsRightLeft } from 'react-icons/hi2';

export default function AlternativeDishButton({ dish, mealType, onOpen }) {
  return (
    <button
      type='button'
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onOpen({
          ...dish,
          mealType
        });
      }}
      className='group inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-2.5 text-xs font-semibold text-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-primary/15'
      title='Món thay thế'
    >
      <HiOutlineArrowsRightLeft className='text-sm' />
      <span>Món thay thế</span>
    </button>
  );
}
