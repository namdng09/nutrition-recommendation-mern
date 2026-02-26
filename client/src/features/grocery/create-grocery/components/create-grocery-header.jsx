import { IoClose, IoListOutline } from 'react-icons/io5';

export default function CreateGroceryHeader({ onClose }) {
  return (
    <div className='flex items-start justify-between mb-8'>
      <div className='flex items-center gap-4'>
        <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm'>
          <IoListOutline size={28} />
        </div>

        <div>
          <h2 className='text-xl font-bold tracking-tight'>
            Tạo danh sách mới
          </h2>

          <p className='text-sm text-muted-foreground'>
            Lên kế hoạch mua sắm thông minh
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className='p-2 rounded-full hover:bg-muted transition-all active:scale-90 text-muted-foreground'
      >
        <IoClose size={24} />
      </button>
    </div>
  );
}
